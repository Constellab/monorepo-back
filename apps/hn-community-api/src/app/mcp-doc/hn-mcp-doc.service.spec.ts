import { TeBlock, TeBlockType, TeRichText, TeRichTextRevision } from '@monorepo/te-text-editor';
import { Repository } from 'typeorm';

import { HnBrickEntity } from '../brick-aggregate/brick/hn-brick.entity';
import {
  HnBrickMajorVersion,
  HnVersionState,
} from '../brick-aggregate/brick-major-version/hn-brick-major-version.entity';
import { HnDocumentation } from '../brick-aggregate/documentation/hn-documentation.entity';
import { HnFolder } from '../brick-aggregate/folder/hn-folder.entity';
import { HnMcpDocService, HnMcpDocTreeFolder } from './hn-mcp-doc.service';

/**
 * Unit test of the two read shapes the write tools need: the tree that is the only source of a
 * folder id, and the raw blocks with their revision. The block verdicts themselves are covered in
 * `libs/te-text-editor/src/te-rich-text-block-inspector.class.spec.ts`.
 */
describe('HnMcpDocService', () => {
  const BRICK_NAME = 'gws_core';

  let doc: HnDocumentation | null;
  let folders: HnFolder[];
  let docs: HnDocumentation[];
  let brickMajorVersion: HnBrickMajorVersion | null;
  /** The parameters the brick version query was built with, to check the version filter. */
  let versionQuery: Record<string, unknown>;
  /** The clauses of that same query, to check *how* "the latest version" was resolved. */
  let versionClauses: string[];
  let service: HnMcpDocService;

  function buildFolder(id: string, title: string, parentId: string | null, order = 0): HnFolder {
    const folder = new HnFolder();
    folder.id = id;
    folder.title = title;
    folder.completePath = parentId == null ? '' : `${title}/`;
    folder.folderId = parentId;
    folder.order = order;
    return folder;
  }

  function buildDoc(id: string, title: string, folder: HnFolder, order = 0): HnDocumentation {
    const documentation = new HnDocumentation();
    documentation.id = id;
    documentation.title = title;
    documentation.completePath = `${folder.completePath ?? ''}${title}/`;
    documentation.folder = folder;
    documentation.order = order;
    documentation.content = null;
    return documentation;
  }

  function buildBrickMajorVersion(major: number): HnBrickMajorVersion {
    const brick = new HnBrickEntity();
    brick.name = BRICK_NAME;
    const version = new HnBrickMajorVersion();
    version.brick = brick;
    version.major = major;
    version.versionState = HnVersionState.LATEST;
    return version;
  }

  /** A query builder standing in for TypeORM's: chainable, and recording its parameters. */
  function buildQueryBuilder(
    one: () => unknown,
    many: () => unknown[],
    parameters?: Record<string, unknown>,
    clauses?: string[]
  ): unknown {
    const record = (clause: string, params: Record<string, unknown> = {}): unknown => {
      clauses?.push(clause);
      Object.assign(parameters ?? {}, params);
      return builder;
    };
    const builder: Record<string, unknown> = {
      select: () => builder,
      addSelect: () => builder,
      leftJoin: () => builder,
      leftJoinAndSelect: () => builder,
      orderBy: (clause: string) => record(`orderBy ${clause}`),
      take: () => builder,
      where: record,
      andWhere: record,
      getOne: () => Promise.resolve(one()),
      getMany: () => Promise.resolve(many()),
    };
    return builder;
  }

  function buildDocumentationsRepository(): Repository<HnDocumentation> {
    return {
      createQueryBuilder: () =>
        buildQueryBuilder(
          () => doc,
          () => docs
        ),
    } as unknown as Repository<HnDocumentation>;
  }

  function buildFoldersRepository(): Repository<HnFolder> {
    return {
      createQueryBuilder: () =>
        buildQueryBuilder(
          () => folders[0] ?? null,
          () => folders
        ),
    } as unknown as Repository<HnFolder>;
  }

  function buildBrickMajorVersionsRepository(): Repository<HnBrickMajorVersion> {
    return {
      createQueryBuilder: () =>
        buildQueryBuilder(
          () => brickMajorVersion,
          () => [],
          versionQuery,
          versionClauses
        ),
    } as unknown as Repository<HnBrickMajorVersion>;
  }

  function richTextOf(...blocks: TeBlock[]): TeRichText {
    return new TeRichText({ ...TeRichText.emptyJson(), blocks });
  }

  beforeEach(() => {
    doc = null;
    folders = [];
    docs = [];
    brickMajorVersion = buildBrickMajorVersion(2);
    versionQuery = {};
    versionClauses = [];
    service = new HnMcpDocService(
      buildDocumentationsRepository(),
      buildFoldersRepository(),
      buildBrickMajorVersionsRepository()
    );
  });

  describe('readBlocks', () => {
    /** A doc holding a paragraph, a figure, and a paragraph carrying forbidden markup. */
    function buildDocWithBlocks(): HnDocumentation {
      const folder = buildFolder('root', 'gws_core', null);
      const documentation = buildDoc('doc-1', 'Getting started', folder);
      documentation.content = richTextOf(
        { id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'Install it with <b>pip</b>' } },
        { id: 'f1', type: TeBlockType.FIGURE, data: { title: 'The pipeline', filename: 'fig-1.png' } },
        { id: 'p2', type: TeBlockType.PARAGRAPH, data: { text: 'Then <span>run</span> it' } }
      ).toJson();
      return documentation;
    }

    it('returns nothing for an unknown id', async () => {
      expect(await service.readBlocks('nope')).toBeNull();
    });

    it('returns the blocks as they are stored, ids included', async () => {
      doc = buildDocWithBlocks();

      const result = await service.readBlocks('doc-1');

      expect(result?.blocks.map((block) => block.id)).toEqual(['p1', 'f1', 'p2']);
      expect(result?.blocks[0]).toMatchObject({
        type: TeBlockType.PARAGRAPH,
        data: { text: 'Install it with <b>pip</b>' },
        editable: true,
      });
      expect(result?.blocks[0].summary).toBeUndefined();
    });

    it('marks a rich block and one with forbidden markup as not editable, with a summary', async () => {
      doc = buildDocWithBlocks();

      const result = await service.readBlocks('doc-1');

      expect(result?.blocks.map((block) => block.editable)).toEqual([true, false, false]);
      expect(result?.blocks[1].summary).toContain('fig-1.png');
      expect(result?.blocks[2].summary).toContain('<span>');
    });

    it('carries the revision of the content, and the page it belongs to', async () => {
      doc = buildDocWithBlocks();

      const result = await service.readBlocks('doc-1');

      expect(result?.revision).toBe(TeRichTextRevision.of(doc.getRichText()));
      expect(result?.id).toBe('doc-1');
      expect(result?.title).toBe('Getting started');
    });

    it('gives the same revision on two reads, another one after a change', async () => {
      doc = buildDocWithBlocks();
      const first = await service.readBlocks('doc-1');
      const second = await service.readBlocks('doc-1');

      doc.content = richTextOf({ id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'edited' } }).toJson();
      const afterEdit = await service.readBlocks('doc-1');

      expect(second?.revision).toBe(first?.revision);
      expect(afterEdit?.revision).not.toBe(first?.revision);
    });
  });

  describe('tree', () => {
    /** root ── (doc "Intro"), (folder "Guides" ── doc "Tasks") */
    function buildSmallTree(): { root: HnFolder; guides: HnFolder } {
      const root = buildFolder('root', 'gws_core', null);
      const guides = buildFolder('guides', 'Guides', 'root', 1);
      folders = [guides, root];
      docs = [buildDoc('doc-intro', 'Intro', root, 0), buildDoc('doc-tasks', 'Tasks', guides, 0)];
      return { root, guides };
    }

    it('returns folders and docs with their ids', async () => {
      buildSmallTree();

      const result = await service.tree(BRICK_NAME);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.tree.root.id).toBe('root');
      const children = result.tree.root.children;
      expect(children[0]).toMatchObject({ type: 'doc', id: 'doc-intro', title: 'Intro' });
      expect(children[1]).toMatchObject({ type: 'folder', id: 'guides', title: 'Guides' });
      expect((children[1] as HnMcpDocTreeFolder).children[0]).toMatchObject({
        type: 'doc',
        id: 'doc-tasks',
      });
    });

    it('names the brick and the version it answered for', async () => {
      buildSmallTree();

      const result = await service.tree(BRICK_NAME);

      expect(result.ok && result.tree.brickName).toBe(BRICK_NAME);
      expect(result.ok && result.tree.version).toBe('latest');
    });

    it('orders the children the way the editor shows them', async () => {
      const root = buildFolder('root', 'gws_core', null);
      folders = [root];
      docs = [buildDoc('doc-b', 'B', root, 2), buildDoc('doc-a', 'A', root, 1)];

      const result = await service.tree(BRICK_NAME);

      expect(result.ok && result.tree.root.children.map((child) => child.id)).toEqual(['doc-a', 'doc-b']);
    });

    it('filters on the major asked for, in either spelling', async () => {
      buildSmallTree();

      await service.tree(BRICK_NAME, 'v3');
      expect(versionQuery.major).toBe(3);

      versionQuery = {};
      await service.tree(BRICK_NAME, '4.1.0');
      expect(versionQuery.major).toBe(4);
    });

    it('asks for no particular major when the version is omitted or "latest"', async () => {
      buildSmallTree();

      await service.tree(BRICK_NAME);
      expect(versionQuery.major).toBeUndefined();

      await service.tree(BRICK_NAME, 'latest');
      expect(versionQuery.major).toBeUndefined();
    });

    /**
     * "The latest" has to mean the same thing here as everywhere else — the row flagged LATEST, not
     * the highest major. Otherwise this tool hands out the folder ids of one version while the
     * listing and reading tools call another one "latest", and a page lands in the wrong tree.
     */
    it('resolves "the latest" by the version state, as the rest of the app does', async () => {
      buildSmallTree();

      await service.tree(BRICK_NAME);

      expect(versionQuery.state).toBe(HnVersionState.LATEST);
      expect(versionClauses.some((clause) => clause.includes('versionState'))).toBe(true);
    });

    it('falls back to the highest major for a brick whose rows carry no state', async () => {
      buildSmallTree();
      // The LATEST-flagged lookup finds nothing; the fallback, ordered by major, has to find the row.
      const version = buildBrickMajorVersion(2);
      let lookups = 0;
      service = new HnMcpDocService(buildDocumentationsRepository(), buildFoldersRepository(), {
        createQueryBuilder: () => {
          lookups += 1;
          const found = lookups === 1 ? null : version;
          return buildQueryBuilder(
            () => found,
            () => [],
            versionQuery,
            versionClauses
          );
        },
      } as unknown as Repository<HnBrickMajorVersion>);

      const result = await service.tree(BRICK_NAME);

      expect(lookups).toBe(2);
      expect(versionClauses.some((clause) => clause.startsWith('orderBy'))).toBe(true);
      expect(result.ok).toBe(true);
    });

    it('does not filter on the version state when a major was asked for', async () => {
      buildSmallTree();

      await service.tree(BRICK_NAME, 'v3');

      expect(versionClauses.some((clause) => clause.includes('versionState'))).toBe(false);
    });

    it('refuses a version that names none, rather than silently answering for another', async () => {
      buildSmallTree();

      const result = await service.tree(BRICK_NAME, 'stable');

      expect(result.ok).toBe(false);
      expect(!result.ok && result.reason).toContain('is not a version');
    });

    it('says so when the brick has no documentation', async () => {
      brickMajorVersion = null;

      const result = await service.tree('nope');

      expect(result.ok).toBe(false);
      expect(!result.ok && result.reason).toContain('community_doc_list');
    });

    /**
     * A truncated tree cannot be told apart from a complete one, so a model shown one would create
     * a page in the wrong folder rather than ask.
     */
    it('refuses rather than truncating a tree over the bound', async () => {
      const root = buildFolder('root', 'gws_core', null);
      folders = [root];
      docs = Array.from({ length: 401 }, (_unused, index) =>
        buildDoc(`doc-${index}`, `Page ${index}`, root, index)
      );

      const result = await service.tree(BRICK_NAME);

      expect(result.ok).toBe(false);
      expect(!result.ok && result.reason).toContain('402 nodes');
      expect(!result.ok && result.reason).toContain('not truncated');
    });

    it('says so when the version has no root folder', async () => {
      folders = [buildFolder('orphan', 'Orphan', 'gone')];

      const result = await service.tree(BRICK_NAME);

      expect(result.ok).toBe(false);
      expect(!result.ok && result.reason).toContain('no root folder');
    });

    /**
     * The other way a tree can come back partial: a folder that does not hang off the root, because
     * its parent is gone or because the parent links form a cycle. Returning the reachable part
     * would be the same silent truncation the node bound refuses.
     */
    it('refuses a tree with a folder that does not hang off the root', async () => {
      const root = buildFolder('root', 'gws_core', null);
      folders = [root, buildFolder('orphan', 'Orphan', 'gone')];

      const result = await service.tree(BRICK_NAME);

      expect(result.ok).toBe(false);
      expect(!result.ok && result.reason).toContain('1 of the 2 folders');
    });

    it('refuses a tree whose folders form a cycle instead of looping forever', async () => {
      const root = buildFolder('root', 'gws_core', null);
      const a = buildFolder('a', 'A', 'b');
      const b = buildFolder('b', 'B', 'a');
      folders = [root, a, b];

      const result = await service.tree(BRICK_NAME);

      expect(result.ok).toBe(false);
      expect(!result.ok && result.reason).toContain('2 of the 3 folders');
    });
  });
});
