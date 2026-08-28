import { BlBadRequestException } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnBrickMajorVersion } from '../brick-aggregate/brick-major-version/hn-brick-major-version.entity';
import { HnDocumentation } from '../brick-aggregate/documentation/hn-documentation.entity';
import { HnNodeDTO, HnNodeType } from '../brick-aggregate/folder/hn-folder.dto';
import { HnFolder } from '../brick-aggregate/folder/hn-folder.entity';
import { HnFolderService } from '../brick-aggregate/folder/hn-folder.service';
import { HnBrickAggregateService } from '../brick-aggregate/hn-brick-aggregate.service';
import { HnErrorText } from '../core/model/config/hn-error-text.class';
import { HnMcpDocAuthorization, HnMcpDocRefusal } from './hn-mcp-doc-authorization.service';

/**
 * The message the tree layer raises when a title is already taken among the siblings. As a plain
 * string, because it is compared against `Error.message`, which is one — and an exception carries
 * the translation key rather than a code to match on.
 */
const HN_TITLE_ALREADY_EXISTS_MESSAGE: string = HnErrorText.NODE_TITLE_ALREADY_EXISTS;

/** A page or a folder as it stands after the operation, read back from what was stored. */
export interface HnMcpDocNode {
  type: 'doc' | 'folder';
  id: string;
  title: string;
  /** The url path of the node. Null only for a root folder, which has none. */
  completePath: string | null;
  /** The parent folder. Null only for a root folder. */
  folderId: string | null;
}

export interface HnMcpDocNodeSuccess {
  ok: true;
  node: HnMcpDocNode;
  /** What else the operation changed, when it changed something the caller did not name. */
  note?: string;
}

export interface HnMcpDocDeleteSuccess {
  ok: true;
  deleted: HnMcpDocNode;
}

export type HnMcpDocNodeResult = HnMcpDocNodeSuccess | HnMcpDocRefusal;
export type HnMcpDocDeleteResult = HnMcpDocDeleteSuccess | HnMcpDocRefusal;

/**
 * The tree operations of the Community documentation MCP: create, rename, move and delete a page,
 * create, rename and move a folder.
 *
 * Every operation goes through {@link HnBrickAggregateService}, the same entry point the site's own
 * controllers call, so the MCP inherits the path resolution, the sibling ordering, the cascade of a
 * complete path down a moved folder's descendants, and the permission check — rather than a second
 * implementation of each, which would drift on the first change. What this service adds is the
 * three things a drag-and-drop UI never has to express:
 *
 * - **Refusals as results.** Not authorized, an unknown folder, a title already taken in that
 *   folder, a title no url can carry: all of them are values in the response, as everywhere else on
 *   this endpoint. Recorded in `docs/adr/0005-the-mcp-manages-the-documentation-tree.md`, with
 *   `docs/adr/0004-the-mcp-writes-documentation-by-operations.md` for where refusals became results.
 * - **Moves the UI cannot even attempt.** A model names ids, so it can ask for a page to move into
 *   another brick's folder, or for a folder to move inside itself. The tree widget can express
 *   neither, so nothing below it guards against either. A move also checks the node's own title
 *   against its new siblings **before** anything is written: the tree operation checks it after it
 *   has already renumbered two folders, and there is no transaction around the two.
 * - **A confirmation on the one destructive operation.** See {@link deleteDoc}.
 */
@Injectable()
export class HnMcpDocStructureService {
  /**
   * How far up the parent chain the cycle check walks before refusing to answer. A folder tree this
   * deep is already broken; the bound is there so a cycle already in the data cannot spin the loop,
   * and exhausting it refuses the move rather than allowing it.
   */
  private static readonly MAX_ANCESTOR_WALK = 50;

  constructor(
    @InjectRepository(HnFolder)
    private readonly foldersRepository: Repository<HnFolder>,
    private readonly brickAggregateService: HnBrickAggregateService,
    private readonly folderService: HnFolderService,
    private readonly authorization: HnMcpDocAuthorization
  ) {}

  ///////////////////////////////////////// PAGES /////////////////////////////////////////

  /**
   * A new page in an existing folder, with no content.
   *
   * Empty on purpose: the content then goes in through `community_doc_edit`, which is the one write
   * path for a page's blocks. A create that also took content would be a second one, with its own
   * block building — and its first version would land outside the modification history, which is
   * derived by comparing what is stored with what is written next.
   */
  async createDoc(folderId: string, title: string): Promise<HnMcpDocNodeResult> {
    const folder = await this.authorization.findFolderWithBrick(folderId);
    if (folder == null) {
      return this.unknownFolder(folderId);
    }

    const refusal =
      (await this.authorization.refuseUnlessAuthorOfFolder(folder)) ?? this.refuseUnusableTitle(title);
    if (refusal != null) {
      return refusal;
    }

    return this.resultOrTitleRefusal(title, 'folder', async () => {
      const created = await this.brickAggregateService.createDoc(this.nodeDto({ title, folderId }));
      return { ok: true, node: this.docNode(created, folderId) };
    });
  }

  /** A page's title, and with it the last segment of its url. */
  async renameDoc(docId: string, title: string): Promise<HnMcpDocNodeResult> {
    const doc = await this.authorization.findDocWithBrick(docId);
    if (doc == null) {
      return this.unknownDoc(docId);
    }

    const refusal =
      (await this.authorization.refuseUnlessAuthorOfDoc(doc)) ?? this.refuseUnusableTitle(title);
    if (refusal != null) {
      return refusal;
    }

    return this.resultOrTitleRefusal(title, 'folder', async () => {
      const renamed = await this.brickAggregateService.updateDoc(this.nodeDto({ id: docId, title }));
      return {
        ok: true,
        node: this.docNode(renamed, doc.folder?.id ?? null),
        note: `The url of the page changed with its title: it is now "${renamed.completePath}".`,
      };
    });
  }

  /** A page into another folder of the same brick version, at the end of it. */
  async moveDoc(docId: string, folderId: string): Promise<HnMcpDocNodeResult> {
    const doc = await this.authorization.findDocWithBrick(docId);
    if (doc == null) {
      return this.unknownDoc(docId);
    }

    const authorized = await this.authorization.refuseUnlessAuthorOfDoc(doc);
    if (authorized != null) {
      return authorized;
    }

    const target = await this.resolveMoveTarget(
      folderId,
      { id: docId, title: doc.title, parentId: doc.folder?.id ?? null },
      doc.folder?.brickMajorVersion ?? null,
      `The page "${doc.title}"`
    );
    if ('ok' in target) {
      return target;
    }

    return this.resultOrInterruptedMove(doc.title, async () => {
      await this.brickAggregateService.updateNodeLocation({
        nodeId: docId,
        nodeType: HnNodeType.DOCUMENTATION,
        oldOrder: doc.order,
        newOrder: target.folder.nextOrder(),
        oldParentId: doc.folder.id,
        newParentId: target.folder.id,
        mainFolderId: target.mainFolderId,
      });
      // Read back rather than assembled: the move recomputes the page's path against its new
      // siblings, so what its url is now is a question only the stored row answers.
      const moved = await this.authorization.findDocWithBrick(docId);
      return {
        ok: true,
        node: this.docNode(moved ?? doc, moved?.folder?.id ?? target.folder.id),
        note: 'The url of the page changed with its folder.',
      };
    });
  }

  /**
   * A page, gone, and the files attached to it with it.
   *
   * `confirm` is the whole guard, and it is deliberately not a judgement on what the page holds: a
   * tool that refused to delete the pages it considers valuable would be refusing exactly the
   * deletions that matter, and allowing the ones nobody would have minded. The annotation on the
   * tool and this flag put the decision where it belongs — with the human the client asks.
   */
  async deleteDoc(docId: string, confirm: boolean): Promise<HnMcpDocDeleteResult> {
    const doc = await this.authorization.findDocWithBrick(docId);
    if (doc == null) {
      return this.unknownDoc(docId);
    }

    const refusal = await this.authorization.refuseUnlessAuthorOfDoc(doc);
    if (refusal != null) {
      return refusal;
    }

    if (!confirm) {
      return {
        ok: false,
        reason:
          `Deleting "${doc.title}" was not confirmed, so nothing was deleted. A page and its files ` +
          `go for good and no rollback brings them back — community_doc_rollback undoes edits to a ` +
          `page that still exists. Ask the person you are working with, then call this tool again ` +
          `with confirm: true.`,
      };
    }

    // Described before it is gone: after the delete there is no row left to read a title from.
    const deleted = this.docNode(doc, doc.folder?.id ?? null);
    await this.brickAggregateService.removeDoc(docId);
    return { ok: true, deleted };
  }

  //////////////////////////////////////// FOLDERS ////////////////////////////////////////
  //
  // There is no folder deletion, and that is a decision rather than an omission — see ADR-0005. A
  // folder deletion is recursive and takes the pages under it with their files; a model that
  // deletes a folder does not lose a page, it loses a branch.

  /** A new folder inside an existing one. */
  async createFolder(parentFolderId: string, title: string): Promise<HnMcpDocNodeResult> {
    const parent = await this.authorization.findFolderWithBrick(parentFolderId);
    if (parent == null) {
      return this.unknownFolder(parentFolderId);
    }

    const refusal =
      (await this.authorization.refuseUnlessAuthorOfFolder(parent)) ?? this.refuseUnusableTitle(title);
    if (refusal != null) {
      return refusal;
    }

    return this.resultOrTitleRefusal(title, 'folder', async () => {
      const created = await this.brickAggregateService.createFolder(
        this.nodeDto({ title, folderId: parentFolderId, isFolder: true })
      );
      return { ok: true, node: this.folderNode(created) };
    });
  }

  /** A folder's title, and with it the url of every page under it. */
  async renameFolder(folderId: string, title: string): Promise<HnMcpDocNodeResult> {
    const folder = await this.authorization.findFolderWithBrick(folderId);
    if (folder == null) {
      return this.unknownFolder(folderId);
    }

    const refusal =
      (await this.authorization.refuseUnlessAuthorOfFolder(folder)) ??
      this.refuseRootFolder(folder, 'renamed') ??
      this.refuseUnusableTitle(title);
    if (refusal != null) {
      return refusal;
    }

    return this.resultOrTitleRefusal(title, 'folder', async () => {
      const renamed = await this.brickAggregateService.updateFolder(
        this.nodeDto({ id: folderId, title, isFolder: true })
      );
      return {
        ok: true,
        node: this.folderNode(renamed),
        note:
          'The url of every page and folder under it changed with it. Read community_doc_tree ' +
          'again if you need the new paths.',
      };
    });
  }

  /** A folder into another folder of the same brick version, at the end of it. */
  async moveFolder(folderId: string, parentFolderId: string): Promise<HnMcpDocNodeResult> {
    const folder = await this.authorization.findFolderWithBrick(folderId);
    if (folder == null) {
      return this.unknownFolder(folderId);
    }

    const authorized =
      (await this.authorization.refuseUnlessAuthorOfFolder(folder)) ?? this.refuseRootFolder(folder, 'moved');
    if (authorized != null) {
      return authorized;
    }

    const what = `The folder "${folder.title ?? ''}"`;
    const target = await this.resolveMoveTarget(
      parentFolderId,
      { id: folderId, title: folder.title, parentId: folder.folderId },
      folder.brickMajorVersion ?? null,
      what
    );
    if ('ok' in target) {
      return target;
    }

    const cycle = await this.refuseCycle(folderId, parentFolderId, what);
    if (cycle != null) {
      return cycle;
    }

    return this.resultOrInterruptedMove(folder.title ?? '', async () => {
      await this.brickAggregateService.updateNodeLocation({
        nodeId: folderId,
        nodeType: HnNodeType.FOLDER,
        oldOrder: folder.order,
        newOrder: target.folder.nextOrder(),
        oldParentId: folder.folderId ?? target.folder.id,
        newParentId: target.folder.id,
        mainFolderId: target.mainFolderId,
      });
      const moved = await this.authorization.findFolderWithBrick(folderId);
      return {
        ok: true,
        node: this.folderNode(moved ?? folder),
        note:
          'The url of every page and folder under it changed with it. Read community_doc_tree ' +
          'again if you need the new paths.',
      };
    });
  }

  ///////////////////////////////////////// SHARED /////////////////////////////////////////

  /**
   * The folder a node is being moved into, or the refusal that says why it cannot be.
   *
   * A move stays inside one brick version. Across versions it would carry a page out from under the
   * authorization just checked and out of the tree the caller read it in; across bricks it would
   * hand one brick's page to another brick's authors. Neither is expressible in the site's tree
   * widget, which is why nothing below this guards against them.
   *
   * The brick version comes in separately from the node because a page's hangs off its folder and a
   * folder's hangs off itself, and the caller is the only place that knows which.
   *
   * The two title checks are here rather than only inside the tree operation because the tree
   * operation raises them **after** it has renumbered the siblings of both folders, one save each and
   * no transaction: a refusal from there would be a refusal on top of a half-done move. Checked
   * before anything is written, with `resolveNodePath` itself rather than a second reading of it.
   */
  private async resolveMoveTarget(
    targetFolderId: string,
    node: { id: string; title: string | null; parentId: string | null },
    brickMajorVersion: HnBrickMajorVersion | null,
    what: string
  ): Promise<{ folder: HnFolder; mainFolderId: string } | HnMcpDocRefusal> {
    if (targetFolderId === node.parentId) {
      return { ok: false, reason: `${what} is already in that folder, so nothing was moved.` };
    }

    const target = await this.authorization.findFolderWithBrick(targetFolderId);
    if (target == null) {
      return this.unknownFolder(targetFolderId);
    }

    const refusal = await this.authorization.refuseUnlessAuthorOfFolder(target);
    if (refusal != null) {
      return refusal;
    }

    if (brickMajorVersion == null || target.brickMajorVersion?.id !== brickMajorVersion.id) {
      return {
        ok: false,
        reason:
          `${what} cannot be moved into that folder: the folder belongs to another brick, or to ` +
          `another version of one. A move stays inside the tree community_doc_tree returned.`,
      };
    }

    // The tree operation needs the brick version's root folder too: it checks the rights on it and
    // rebuilds the tree from there.
    const mainFolder = await this.folderService.findFolderByBrickMajorVersion(brickMajorVersion);
    if (mainFolder == null) {
      return {
        ok: false,
        reason: `${what} belongs to a brick version with no root folder, so nothing can be moved in it.`,
      };
    }

    // Reloaded with its children: the move appends the node at the end of the target folder, and the
    // authorization query stops before those relations.
    const withChildren = await this.folderService.findById(target.id);
    if (withChildren == null) {
      return this.unknownFolder(targetFolderId);
    }

    return (
      this.refuseMovedTitle(withChildren, node, what) ?? { folder: withChildren, mainFolderId: mainFolder.id }
    );
  }

  /**
   * The move applies the node's existing title to its new siblings, so the two things a title can be
   * wrong about are both live on a move — and neither was asked of the caller here, because the
   * title was set long ago, possibly through the site or the CLI.
   *
   * `resolveNodePath` is called rather than reproduced: it is the function the move itself calls, and
   * calling it here is the only way to pre-empt its verdict without inventing a second notion of "the
   * same title". Its computed path is thrown away — only whether it refuses matters.
   */
  private refuseMovedTitle(
    target: HnFolder,
    node: { id: string; title: string | null },
    what: string
  ): HnMcpDocRefusal | null {
    if (HnFolderService.slugify(node.title) === '') {
      return {
        ok: false,
        reason:
          `${what} has a title nothing is left of once it is turned into a url segment, so moving it ` +
          `would give it a url no one can reach. Rename it first, then move it.`,
      };
    }

    try {
      HnFolderService.resolveNodePath(target, node.title, node.id);
      return null;
    } catch (error) {
      if (!this.isTitleTaken(error)) {
        throw error;
      }
      return this.titleTakenRefusal('target folder', node.title ?? '', 'Nothing was moved.');
    }
  }

  /**
   * A folder cannot become its own descendant. The site's tree widget cannot express it; a model
   * naming ids can, and the result is a branch detached from the root — which the read tools then
   * refuse to return as a tree at all, so the whole brick's documentation becomes unbrowsable.
   *
   * The walk is bounded, and running out of the bound is itself a refusal rather than a pass. A chain
   * longer than the bound is either a tree nobody meant to build or one that already holds a cycle —
   * which is precisely the case the bound exists to survive — and answering "no cycle" because the
   * question could not be settled would allow the one move this method exists to prevent.
   */
  private async refuseCycle(
    folderId: string,
    targetFolderId: string,
    what: string
  ): Promise<HnMcpDocRefusal | null> {
    let ancestorId: string | null = targetFolderId;
    for (let step = 0; step < HnMcpDocStructureService.MAX_ANCESTOR_WALK; step++) {
      if (ancestorId == null) {
        // The root of the version, reached without meeting the folder: the move is not a cycle.
        return null;
      }
      if (ancestorId === folderId) {
        return {
          ok: false,
          reason: `${what} cannot be moved inside itself or inside one of its own sub-folders.`,
        };
      }
      const ancestor: HnFolder | null = await this.foldersRepository
        .createQueryBuilder('folder')
        .select(['folder.id', 'folder.folderId'])
        .where('folder.id = :id', { id: ancestorId })
        .getOne();
      ancestorId = ancestor?.folderId ?? null;
    }

    return {
      ok: false,
      reason:
        `${what} was not moved: the chain of folders above the target is more than ` +
        `${HnMcpDocStructureService.MAX_ANCESTOR_WALK} deep, so whether the move would put the folder ` +
        `inside itself cannot be established. Read community_doc_tree — that documentation's folder ` +
        `structure needs a human to look at it.`,
    };
  }

  /**
   * The root folder of a brick version is that version's documentation itself: it has no parent to
   * move it under, and its title is shown nowhere — renaming it would rewrite every url of the
   * version for nothing visible.
   */
  private refuseRootFolder(folder: HnFolder, verb: string): HnMcpDocRefusal | null {
    if (folder.folderId != null) {
      return null;
    }
    return {
      ok: false,
      reason:
        `That folder is the root of the brick version's documentation and cannot be ${verb}. It is ` +
        `the folder community_doc_tree returns as "root".`,
    };
  }

  /**
   * A title has to survive slugification, because the segment it produces is the node's url. One
   * made only of characters the slug drops would create a node no url reaches, and no error
   * anywhere.
   */
  private refuseUnusableTitle(title: string): HnMcpDocRefusal | null {
    if (HnFolderService.slugify(title) !== '') {
      return null;
    }
    return {
      ok: false,
      reason:
        `"${title}" cannot be a title here: the url is built from it, and nothing is left of it once ` +
        `accents and punctuation are removed. Use a title with at least one letter or digit.`,
    };
  }

  /**
   * Runs a create or a rename, turning the one refusal the tree layer raises as an exception into a
   * result.
   *
   * A title already taken among the siblings is the refusal a model will actually meet, and the check
   * raising it lives in `HnFolderService.resolveNodePath` — reimplementing its notion of "the same
   * title" here to pre-empt it is exactly the divergence this service avoids elsewhere. Every other
   * exception is left alone: it is a fault, not a verdict.
   *
   * "Nothing was changed" is true for these two: on both paths the path resolution runs before the
   * first save. It is not true of a move, which is why a move does not come through here.
   */
  private async resultOrTitleRefusal(
    title: string,
    where: string,
    run: () => Promise<HnMcpDocNodeSuccess>
  ): Promise<HnMcpDocNodeResult> {
    try {
      return await run();
    } catch (error) {
      if (!this.isTitleTaken(error)) {
        throw error;
      }
      return this.titleTakenRefusal(where, title, 'Nothing was changed.');
    }
  }

  /**
   * Runs a move, whose title collision {@link refuseMovedTitle} has already ruled out.
   *
   * One reaching here is the same collision appearing between that check and the write — and by then
   * the tree operation has renumbered the siblings of both folders, one save each and no transaction,
   * before it resolves the path that refuses. So this refusal cannot claim nothing changed. It says
   * what it knows: the node is somewhere the caller has to look at.
   */
  private async resultOrInterruptedMove(
    title: string,
    run: () => Promise<HnMcpDocNodeSuccess>
  ): Promise<HnMcpDocNodeResult> {
    try {
      return await run();
    } catch (error) {
      if (!this.isTitleTaken(error)) {
        throw error;
      }
      return {
        ok: false,
        reason:
          `The move was interrupted: the target folder gained a page or a folder called "${title}" ` +
          `while it was running, and the two would be indistinguishable in the tree. Some of the ` +
          `reordering may already have been written. Read community_doc_tree to see where things are ` +
          `now before doing anything else.`,
      };
    }
  }

  /** The tree layer's verdict that a sibling already carries this title, and nothing else. */
  private isTitleTaken(error: unknown): boolean {
    return error instanceof BlBadRequestException && error.message === HN_TITLE_ALREADY_EXISTS_MESSAGE;
  }

  private titleTakenRefusal(where: string, title: string, aftermath: string): HnMcpDocRefusal {
    return {
      ok: false,
      reason:
        `The ${where} already holds a page or a folder called "${title}", and the two would be ` +
        `indistinguishable in the tree. ${aftermath} Pick another title, or edit the one that is ` +
        `already there.`,
    };
  }

  private nodeDto(fields: { id?: string; title: string; folderId?: string; isFolder?: boolean }): HnNodeDTO {
    const dto = new HnNodeDTO();
    if (fields.id != null) {
      dto.id = fields.id;
    }
    dto.title = fields.title;
    dto.path = null;
    dto.folderId = fields.folderId;
    dto.isFolder = fields.isFolder ?? false;
    return dto;
  }

  private docNode(doc: HnDocumentation, folderId: string | null): HnMcpDocNode {
    return {
      type: 'doc',
      id: doc.id,
      title: doc.title,
      completePath: doc.completePath,
      folderId,
    };
  }

  private folderNode(folder: HnFolder): HnMcpDocNode {
    return {
      type: 'folder',
      id: folder.id,
      title: folder.title ?? '',
      completePath: folder.completePath,
      folderId: folder.folderId,
    };
  }

  private unknownDoc(docId: string): HnMcpDocRefusal {
    return {
      ok: false,
      reason:
        `No page found for id "${docId}". Page ids come from community_doc_tree, community_doc_list ` +
        `or community_doc_search.`,
    };
  }

  private unknownFolder(folderId: string): HnMcpDocRefusal {
    return {
      ok: false,
      reason: `No folder found for id "${folderId}". community_doc_tree is the only source of a folder id.`,
    };
  }
}
