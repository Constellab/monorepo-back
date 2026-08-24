import { TeBlock, TeMarkdown, TeRichTextBlockInspector, TeRichTextRevision } from '@monorepo/te-text-editor';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import {
  HnBrickMajorVersion,
  HnVersionState,
} from '../brick-aggregate/brick-major-version/hn-brick-major-version.entity';
import { HnDocumentation } from '../brick-aggregate/documentation/hn-documentation.entity';
import { HnFolder } from '../brick-aggregate/folder/hn-folder.entity';

export interface HnMcpDocSummary {
  id: string;
  title: string;
  completePath: string;
  brickName: string | null;
  version: string | null;
  snippet?: string;
}

export interface HnMcpDocContent extends HnMcpDocSummary {
  markdown: string;
}

/** One block of a document, as it is stored, with the verdict on what may be done to it. */
export interface HnMcpDocBlock {
  /** The block id the write tools name. Null for a legacy block saved before ids existed. */
  id: string | null;
  type: string;
  data: TeBlock['data'];
  /** `false` means: move it or delete it, never rewrite it. */
  editable: boolean;
  /** What the block holds and why it cannot be rewritten. Present only when not editable. */
  summary?: string;
}

export interface HnMcpDocBlocks extends HnMcpDocSummary {
  /**
   * The hash of the content that was just read. Sent back on write, it refuses an edit prepared
   * against content someone else has since replaced.
   */
  revision: string;
  blocks: HnMcpDocBlock[];
}

export interface HnMcpDocTreeDoc {
  type: 'doc';
  id: string;
  title: string;
  completePath: string;
}

export interface HnMcpDocTreeFolder {
  type: 'folder';
  /** The id a page creation names as its parent — this tool is the only source of one. */
  id: string;
  title: string;
  completePath: string | null;
  children: HnMcpDocTreeNode[];
}

export type HnMcpDocTreeNode = HnMcpDocTreeFolder | HnMcpDocTreeDoc;

export interface HnMcpDocTree {
  brickName: string;
  version: string;
  root: HnMcpDocTreeFolder;
}

/**
 * Why a tree could not be returned, in a sentence meant for the model rather than for a log.
 *
 * A refusal is a result here, not an exception: an unknown brick, an unknown version and a tree
 * too large to send are all things a model can act on — by listing the bricks, by asking for
 * another version, by falling back to the flat listing — and none of them is a server fault.
 */
export type HnMcpDocTreeResult = { ok: true; tree: HnMcpDocTree } | { ok: false; reason: string };

/**
 * Read-only access to the community documentation for the MCP server.
 *
 * Two shapes of the same content are served, because two things are done with it:
 *
 * - {@link read} renders a page as markdown — right for answering a question, useless for editing
 *   one: markdown loses the rich blocks, the header metadata, and above all the block ids, which
 *   are what the modification history is matched on.
 * - {@link readBlocks} returns the raw EditorJS blocks, ids included, plus the revision of the
 *   document. That is the vocabulary the `gws community` CLI and the editor already speak.
 */
@Injectable()
export class HnMcpDocService {
  private static readonly SNIPPET_RADIUS = 160;

  /**
   * How many nodes a tree may carry before the tool refuses to answer.
   *
   * A truncated tree is worse than no tree: a model shown a partial tree cannot tell a folder that
   * does not exist from one that was cut, and would create a page in the wrong place rather than
   * ask. Above this, the flat listing is the tool to use.
   */
  private static readonly MAX_TREE_NODES = 400;

  constructor(
    @InjectRepository(HnDocumentation)
    private readonly documentationsRepository: Repository<HnDocumentation>,
    @InjectRepository(HnFolder)
    private readonly foldersRepository: Repository<HnFolder>,
    @InjectRepository(HnBrickMajorVersion)
    private readonly brickMajorVersionsRepository: Repository<HnBrickMajorVersion>
  ) {}

  /**
   * Full-text-ish search over doc title and content.
   *
   * NOTE: the content match runs a `LIKE` on the raw `TeRichText` JSON, so it also
   * matches HTML markup/keys — good enough for v1 recall; the returned snippet is
   * extracted from the markdown-rendered body, not the raw JSON.
   */
  async search(query: string, limit = 10): Promise<HnMcpDocSummary[]> {
    const like = `%${query}%`;
    const docs = await this.baseQuery()
      .where('doc.title LIKE :like', { like })
      .orWhere('doc.content LIKE :like', { like })
      .take(limit)
      .getMany();

    return docs.map((doc) => ({
      ...this.toSummary(doc),
      snippet: this.buildSnippet(doc, query),
    }));
  }

  /**
   * List docs, optionally filtered by (case-insensitive substring of) brick name.
   */
  async list(brickName?: string, limit = 50): Promise<HnMcpDocSummary[]> {
    const qb = this.baseQuery().orderBy('doc.completePath', 'ASC').take(limit);
    if (brickName) {
      qb.where('brick.name LIKE :name', { name: `%${brickName}%` });
    }
    const docs = await qb.getMany();
    return docs.map((doc) => this.toSummary(doc));
  }

  /**
   * Read a single doc rendered as markdown.
   */
  async read(id: string): Promise<HnMcpDocContent | null> {
    const doc = await this.baseQuery().where('doc.id = :id', { id }).getOne();
    if (doc == null) {
      return null;
    }
    return {
      ...this.toSummary(doc),
      markdown: TeMarkdown.fromRichText(doc.getRichText()),
    };
  }

  /**
   * Read a single doc as the raw EditorJS blocks it is stored as, with the revision of that
   * content and, for each block, whether a model may rewrite it.
   */
  async readBlocks(id: string): Promise<HnMcpDocBlocks | null> {
    const doc = await this.baseQuery().where('doc.id = :id', { id }).getOne();
    if (doc == null) {
      return null;
    }

    const richText = doc.getRichText();
    return {
      ...this.toSummary(doc),
      revision: TeRichTextRevision.of(richText),
      blocks: TeRichTextBlockInspector.inspect(richText).map(({ block, editable, summary }) => ({
        id: block?.id ?? null,
        type: block?.type,
        data: block?.data,
        editable,
        ...(summary == null ? {} : { summary }),
      })),
    };
  }

  /**
   * The folder and doc tree of one brick version, with the ids of both.
   *
   * The flat listing next to it answers a different question — "which brick should I look at?" —
   * and stays as it is. This one answers "where does a page go?", and is the only source of a
   * folder id, so nothing can be created without it.
   */
  async tree(brickName: string, version?: string): Promise<HnMcpDocTreeResult> {
    if (!this.namesAVersion(version)) {
      return {
        ok: false,
        reason:
          `"${String(version)}" is not a version. Pass the version as the listing tools return it — ` +
          `"latest" or "v2" — or omit it to get the latest.`,
      };
    }
    const major = this.majorOf(version);

    const brickMajorVersion = await this.findBrickMajorVersion(brickName, major);
    if (brickMajorVersion == null) {
      return {
        ok: false,
        reason:
          `No documentation found for brick "${brickName}"` +
          `${major == null ? '' : ` in version v${major}`}. Use community_doc_list to see which ` +
          `bricks have documentation.`,
      };
    }

    const folders = await this.findVersionFolders(brickMajorVersion.id);
    const docs = await this.findVersionDocs(brickMajorVersion.id);

    const nodeCount = folders.length + docs.length;
    if (nodeCount > HnMcpDocService.MAX_TREE_NODES) {
      return {
        ok: false,
        reason:
          `The documentation of "${brickName}" has ${nodeCount} nodes, more than the ` +
          `${HnMcpDocService.MAX_TREE_NODES} this tool returns. It is not truncated, because a ` +
          `partial tree cannot be told apart from a complete one. Use community_doc_list with ` +
          `brickName "${brickName}" to find the page you are after.`,
      };
    }

    // The brick's main folder: the one folder of this version with no parent.
    const rootFolder = folders.find((folder) => folder.folderId == null);
    if (rootFolder == null) {
      return {
        ok: false,
        reason: `The documentation of "${brickName}" has no root folder, so its tree cannot be built.`,
      };
    }

    const built = new Set<string>();
    const root = this.buildTreeFolder(rootFolder, folders, docs, built);

    // Every folder of the version has to hang off the root. One that does not — a cycle in the
    // parent links, or a folder whose parent is gone — would come back as a tree missing a branch,
    // and a branch that is missing cannot be told from one that never existed.
    if (built.size !== folders.length) {
      return {
        ok: false,
        reason:
          `${folders.length - built.size} of the ${folders.length} folders of "${brickName}" do not ` +
          `hang off its root folder, so the tree cannot be returned whole. Use community_doc_list ` +
          `with brickName "${brickName}" to find the page you are after.`,
      };
    }

    return {
      ok: true,
      tree: {
        brickName: brickMajorVersion.brick?.name ?? brickName,
        version: brickMajorVersion.getStrVersion(),
        root,
      },
    };
  }

  /**
   * `built` collects the folders that made it into the tree, so the caller can tell a complete tree
   * from one a cycle cut short. It doubles as the cycle guard: a folder is expanded once.
   */
  private buildTreeFolder(
    folder: HnFolder,
    folders: HnFolder[],
    docs: HnDocumentation[],
    built: Set<string>
  ): HnMcpDocTreeFolder {
    built.add(folder.id);

    const children: { order: number; node: HnMcpDocTreeNode }[] = docs
      .filter((doc) => doc.folder?.id === folder.id)
      .map((doc) => ({
        order: doc.order,
        node: {
          type: 'doc' as const,
          id: doc.id,
          title: doc.title,
          completePath: doc.completePath,
        },
      }));

    const childFolders = folders.filter(
      (candidate) => candidate.folderId === folder.id && !built.has(candidate.id)
    );
    for (const child of childFolders) {
      children.push({ order: child.order, node: this.buildTreeFolder(child, folders, docs, built) });
    }

    return {
      type: 'folder',
      id: folder.id,
      title: folder.title ?? '',
      completePath: folder.completePath,
      // The order the editor shows, so a model reading the tree reads the page in reading order.
      children: children.sort((a, b) => a.order - b.order).map(({ node }) => node),
    };
  }

  /**
   * Only the columns the tree shows. A doc's `content` is a longtext holding the whole page, and
   * loading a brick's worth of them to print their titles — including on the way to refusing a tree
   * for being too large — is the one expensive thing this query could do.
   */
  private findVersionDocs(brickMajorVersionId: string): Promise<HnDocumentation[]> {
    return this.documentationsRepository
      .createQueryBuilder('doc')
      .select(['doc.id', 'doc.title', 'doc.completePath', 'doc.order'])
      .leftJoin('doc.folder', 'folder')
      .addSelect('folder.id')
      .where('folder.brickMajorVersion = :brickMajorVersionId', { brickMajorVersionId })
      .getMany();
  }

  private findVersionFolders(brickMajorVersionId: string): Promise<HnFolder[]> {
    return this.foldersRepository
      .createQueryBuilder('folder')
      .select(['folder.id', 'folder.title', 'folder.completePath', 'folder.order', 'folder.folderId'])
      .where('folder.brickMajorVersion = :brickMajorVersionId', { brickMajorVersionId })
      .getMany();
  }

  /**
   * Both spellings a model can have seen: `getStrVersion`'s `v2`, which the listing tools return,
   * and the `2.1.0` of a package version, whose major is what a documentation is attached to.
   */
  private static readonly VERSION_REGEX = /^v?(\d+)(\.\d+\.\d+(-beta\.\d+)?)?$/i;

  /** Whether the caller asked for a version at all, and if so for one that exists as a spelling. */
  private namesAVersion(version?: string): boolean {
    const asked = this.askedVersion(version);
    return asked == null || HnMcpDocService.VERSION_REGEX.test(asked);
  }

  /**
   * The major the caller asked for, or `null` for "the latest one" — which is what an omitted
   * version and an explicit `latest` both mean. Only called on a string {@link namesAVersion}
   * accepted.
   */
  private majorOf(version?: string): number | null {
    const asked = this.askedVersion(version);
    if (asked == null) {
      return null;
    }
    const match = HnMcpDocService.VERSION_REGEX.exec(asked);
    return match == null ? null : Number(match[1]);
  }

  /** The version string the caller actually asked for, or `null` when it means "the latest". */
  private askedVersion(version?: string): string | null {
    const trimmed = version?.trim();
    if (trimmed == null || trimmed === '' || trimmed.toLowerCase() === 'latest') {
      return null;
    }
    return trimmed;
  }

  /**
   * `null` for `major` means "the latest", and that is the row flagged `LATEST` — the same
   * definition `HnBrickMajorVersionService` uses, and the one the listing tools report through
   * `getStrVersion`. Reading it as "the highest major" instead would hand out the folder ids of one
   * version while every other tool called another one "latest", and a page would be created in the
   * wrong version's tree.
   *
   * The highest major is the fallback for a brick whose rows carry no flag at all, so a tree is
   * still returned rather than a "no documentation" that is not true.
   */
  private async findBrickMajorVersion(
    brickName: string,
    major: number | null
  ): Promise<HnBrickMajorVersion | null> {
    if (major != null) {
      return this.brickMajorVersionQuery(brickName)
        .andWhere('brickMajorVersion.major = :major', { major })
        .getOne();
    }

    const latest = await this.brickMajorVersionQuery(brickName)
      .andWhere('brickMajorVersion.versionState = :state', { state: HnVersionState.LATEST })
      .getOne();

    return (
      latest ?? this.brickMajorVersionQuery(brickName).orderBy('brickMajorVersion.major', 'DESC').getOne()
    );
  }

  private brickMajorVersionQuery(brickName: string): SelectQueryBuilder<HnBrickMajorVersion> {
    return this.brickMajorVersionsRepository
      .createQueryBuilder('brickMajorVersion')
      .leftJoinAndSelect('brickMajorVersion.brick', 'brick')
      .where('brick.name = :brickName', { brickName });
  }

  private baseQuery(): SelectQueryBuilder<HnDocumentation> {
    return this.documentationsRepository
      .createQueryBuilder('doc')
      .leftJoinAndSelect('doc.folder', 'folder')
      .leftJoinAndSelect('folder.brickMajorVersion', 'brickMajorVersion')
      .leftJoinAndSelect('brickMajorVersion.brick', 'brick');
  }

  private toSummary(doc: HnDocumentation): HnMcpDocSummary {
    const brickMajorVersion = doc.folder?.brickMajorVersion;
    return {
      id: doc.id,
      title: doc.title,
      completePath: doc.completePath,
      brickName: brickMajorVersion?.brick?.name ?? null,
      version: brickMajorVersion?.getStrVersion() ?? null,
    };
  }

  private buildSnippet(doc: HnDocumentation, query: string): string {
    const markdown = TeMarkdown.fromRichText(doc.getRichText());
    const plain = markdown.replace(/\s+/g, ' ').trim();
    const matchIndex = plain.toLowerCase().indexOf(query.toLowerCase());
    if (matchIndex === -1) {
      return plain.slice(0, HnMcpDocService.SNIPPET_RADIUS * 2);
    }
    const start = Math.max(0, matchIndex - HnMcpDocService.SNIPPET_RADIUS);
    const end = Math.min(plain.length, matchIndex + query.length + HnMcpDocService.SNIPPET_RADIUS);
    return `${start > 0 ? '…' : ''}${plain.slice(start, end)}${end < plain.length ? '…' : ''}`;
  }
}
