import { BlBadRequestException, BlRequestContext, BlUnauthorizedException } from '@monorepo/back-core-lib';
import { Request, Response } from 'express';
import { Repository } from 'typeorm';

import { HnBrickEntity } from '../brick-aggregate/brick/hn-brick.entity';
import { HnBrickMajorVersion } from '../brick-aggregate/brick-major-version/hn-brick-major-version.entity';
import { HnDocumentation } from '../brick-aggregate/documentation/hn-documentation.entity';
import { HnNodeDTO, HnNodeType } from '../brick-aggregate/folder/hn-folder.dto';
import { HnFolder } from '../brick-aggregate/folder/hn-folder.entity';
import { HnFolderService } from '../brick-aggregate/folder/hn-folder.service';
import { HnBrickAggregateService, HnNodeLocationUpdate } from '../brick-aggregate/hn-brick-aggregate.service';
import { HnBrickSecurity } from '../brick-aggregate/security/hn-brick.security';
import { HnErrorText } from '../core/model/config/hn-error-text.class';
import { HnCurrentUserHelper } from '../core/utils/hn-current-user.helper';
import { HnUser } from '../users/hn-user.entity';
import { HnMcpDocAuthorization } from './hn-mcp-doc-authorization.service';
import { HnMcpDocStructureService } from './hn-mcp-doc-structure.service';

/**
 * Unit test of what the tree tools add on top of the aggregate service they delegate to: who may
 * change the tree, the moves a drag-and-drop UI cannot express, the confirmation on the one
 * destructive tool, and turning the tree layer's own refusal into a result. The path resolution and
 * the sibling ordering are the aggregate's, tested where they live.
 */
describe('HnMcpDocStructureService', () => {
  const USER_ID = 'user-1';
  const ROOT_ID = 'folder-root';
  const GUIDES_ID = 'folder-guides';
  const NESTED_ID = 'folder-nested';
  const OTHER_VERSION_FOLDER_ID = 'folder-v2';
  const DOC_ID = 'doc-1';

  let brick: HnBrickEntity;
  let version: HnBrickMajorVersion;
  let otherVersion: HnBrickMajorVersion;
  let folders: Map<string, HnFolder>;
  let docs: Map<string, HnDocumentation>;
  let authorized: boolean;
  /** Something other than a verdict going wrong inside the authorization check. */
  let securityFailure: Error | null;
  /** What the aggregate service was asked to do, in order. */
  let calls: string[];
  /** Set to make the next tree write refuse the way `resolveNodePath` refuses a taken title. */
  let titleTaken: boolean;
  let service: HnMcpDocStructureService;

  function buildFolder(id: string, parentId: string | null, title: string | null, path: string): HnFolder {
    const folder = new HnFolder();
    folder.id = id;
    folder.title = title;
    folder.folderId = parentId;
    folder.completePath = path === '' ? null : path;
    folder.path = title == null ? null : title.toLowerCase();
    folder.order = 0;
    folder.brickMajorVersion = version;
    folder.folders = [];
    folder.documentations = [];
    return folder;
  }

  function buildDoc(id: string, folder: HnFolder, title: string): HnDocumentation {
    const doc = new HnDocumentation();
    doc.id = id;
    doc.title = title;
    doc.completePath = `${folder.completePath ?? ''}${title.toLowerCase()}/`;
    doc.order = 3;
    doc.folder = folder;
    return doc;
  }

  /** A repository whose query builder answers the id the `where` clause names, and nothing else. */
  function buildRepository<T extends { id: string }>(rows: () => Map<string, T>): Repository<T> {
    return {
      createQueryBuilder: () => {
        let wanted: string | null = null;
        const builder: Record<string, unknown> = {
          select: () => builder,
          leftJoinAndSelect: () => builder,
          where: (_clause: string, parameters: { id: string }) => {
            wanted = parameters.id;
            return builder;
          },
          getOne: () => Promise.resolve(wanted == null ? null : (rows().get(wanted) ?? null)),
        };
        return builder;
      },
    } as unknown as Repository<T>;
  }

  function buildBrickSecurity(): HnBrickSecurity {
    return {
      assertIsCreatorOrCoAuthor: (): Promise<void> => {
        if (securityFailure != null) {
          return Promise.reject(securityFailure);
        }
        return authorized ? Promise.resolve() : Promise.reject(new BlUnauthorizedException('nope'));
      },
    } as unknown as HnBrickSecurity;
  }

  function buildFolderService(): HnFolderService {
    return {
      findFolderByBrickMajorVersion: (brickMajorVersion: HnBrickMajorVersion): Promise<HnFolder | null> =>
        Promise.resolve(brickMajorVersion.id === version.id ? (folders.get(ROOT_ID) ?? null) : null),
      findById: (id: string): Promise<HnFolder | null> => Promise.resolve(folders.get(id) ?? null),
    } as unknown as HnFolderService;
  }

  /**
   * Stands in for the entry point the site's own controllers call. It records what it was asked and
   * hands back what the real one would, so the test can see both the delegation and the response.
   */
  function buildBrickAggregateService(): HnBrickAggregateService {
    const refuseIfTitleTaken = (): void => {
      if (titleTaken) {
        throw new BlBadRequestException(HnErrorText.NODE_TITLE_ALREADY_EXISTS);
      }
    };

    return {
      createDoc: (dto: HnNodeDTO): Promise<HnDocumentation> => {
        calls.push(`createDoc(${dto.folderId},${dto.title})`);
        refuseIfTitleTaken();
        const folder = folders.get(dto.folderId ?? '') as HnFolder;
        return Promise.resolve(buildDoc('doc-new', folder, dto.title ?? ''));
      },
      updateDoc: (dto: HnNodeDTO): Promise<HnDocumentation> => {
        calls.push(`updateDoc(${dto.id},${dto.title})`);
        refuseIfTitleTaken();
        const doc = docs.get(dto.id) as HnDocumentation;
        return Promise.resolve(buildDoc(doc.id, doc.folder, dto.title ?? ''));
      },
      removeDoc: (id: string): Promise<void> => {
        calls.push(`removeDoc(${id})`);
        docs.delete(id);
        return Promise.resolve();
      },
      createFolder: (dto: HnNodeDTO): Promise<HnFolder> => {
        calls.push(`createFolder(${dto.folderId},${dto.title})`);
        refuseIfTitleTaken();
        const parent = folders.get(dto.folderId ?? '') as HnFolder;
        return Promise.resolve(
          buildFolder('folder-new', parent.id, dto.title ?? '', `${parent.completePath ?? ''}new/`)
        );
      },
      updateFolder: (dto: HnNodeDTO): Promise<HnFolder> => {
        calls.push(`updateFolder(${dto.id},${dto.title})`);
        refuseIfTitleTaken();
        const folder = folders.get(dto.id) as HnFolder;
        return Promise.resolve(buildFolder(folder.id, folder.folderId, dto.title ?? '', 'renamed/'));
      },
      updateNodeLocation: ({
        nodeId,
        nodeType,
        oldOrder,
        newOrder,
        oldParentId,
        newParentId,
        mainFolderId,
      }: HnNodeLocationUpdate): Promise<unknown> => {
        calls.push(
          `updateNodeLocation(${nodeId},${nodeType},${oldOrder}->${newOrder},` +
            `${oldParentId}->${newParentId},main=${mainFolderId})`
        );
        return Promise.resolve(null);
      },
    } as unknown as HnBrickAggregateService;
  }

  /** Every real call runs in a request scope with the MCP user resolved by the guard. */
  function asUser<T>(run: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      BlRequestContext.runWithContext(new BlRequestContext({} as Request, {} as Response, null, {}), () => {
        HnCurrentUserHelper.setAuthContext({ type: 'mcp', user: { id: USER_ID } as HnUser });
        run().then(resolve, reject);
      });
    });
  }

  beforeEach(() => {
    brick = new HnBrickEntity();
    brick.name = 'gws_core';

    version = new HnBrickMajorVersion();
    version.id = 'bmv-1';
    version.brick = brick;

    otherVersion = new HnBrickMajorVersion();
    otherVersion.id = 'bmv-2';
    otherVersion.brick = brick;

    const root = buildFolder(ROOT_ID, null, null, '');
    const guides = buildFolder(GUIDES_ID, ROOT_ID, 'Guides', 'guides/');
    const nested = buildFolder(NESTED_ID, GUIDES_ID, 'Nested', 'guides/nested/');
    const otherVersionFolder = buildFolder(OTHER_VERSION_FOLDER_ID, null, null, '');
    otherVersionFolder.brickMajorVersion = otherVersion;

    folders = new Map([
      [ROOT_ID, root],
      [GUIDES_ID, guides],
      [NESTED_ID, nested],
      [OTHER_VERSION_FOLDER_ID, otherVersionFolder],
    ]);
    docs = new Map([[DOC_ID, buildDoc(DOC_ID, guides, 'Getting started')]]);

    authorized = true;
    securityFailure = null;
    calls = [];
    titleTaken = false;

    service = new HnMcpDocStructureService(
      buildRepository(() => folders),
      buildBrickAggregateService(),
      buildFolderService(),
      new HnMcpDocAuthorization(
        buildRepository(() => docs),
        buildRepository(() => folders),
        buildBrickSecurity()
      )
    );
  });

  describe('creating a page', () => {
    it('creates it in the folder and hands back where it landed', async () => {
      const result = await asUser(() => service.createDoc(GUIDES_ID, 'Installation'));

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.node).toEqual({
        type: 'doc',
        id: 'doc-new',
        title: 'Installation',
        completePath: 'guides/installation/',
        folderId: GUIDES_ID,
      });
    });

    /**
     * The page is created empty and its content goes in through the edit tool afterwards. A create
     * that also wrote content would be a second write path for a page's blocks, and its first
     * version would land outside the modification history.
     */
    it('creates an empty page: nothing about content is passed on', async () => {
      await asUser(() => service.createDoc(GUIDES_ID, 'Installation'));

      expect(calls).toEqual([`createDoc(${GUIDES_ID},Installation)`]);
    });

    it('refuses an unknown folder, and says where folder ids come from', async () => {
      const result = await asUser(() => service.createDoc('ghost', 'Installation'));

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.reason).toContain('No folder found');
      expect(result.reason).toContain('community_doc_tree');
      expect(calls).toEqual([]);
    });

    it('refuses a title nothing survives of once it is turned into a url', async () => {
      const result = await asUser(() => service.createDoc(GUIDES_ID, '!!!'));

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.reason).toContain('at least one letter or digit');
      expect(calls).toEqual([]);
    });

    it('turns a title already taken among the siblings into a refusal, not an exception', async () => {
      titleTaken = true;

      const result = await asUser(() => service.createDoc(GUIDES_ID, 'Installation'));

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.reason).toContain('already holds a page or a folder called "Installation"');
    });
  });

  describe('renaming and moving a page', () => {
    it('renames it and warns that the url followed', async () => {
      const result = await asUser(() => service.renameDoc(DOC_ID, 'Getting started, again'));

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.node.title).toBe('Getting started, again');
      expect(result.note).toContain('url');
      expect(calls).toEqual([`updateDoc(${DOC_ID},Getting started, again)`]);
    });

    it('moves it to the end of the target folder, through the tree operation the site uses', async () => {
      const result = await asUser(() => service.moveDoc(DOC_ID, NESTED_ID));

      expect(result.ok).toBe(true);
      expect(calls).toEqual([
        `updateNodeLocation(${DOC_ID},${HnNodeType.DOCUMENTATION},3->0,` +
          `${GUIDES_ID}->${NESTED_ID},main=${ROOT_ID})`,
      ]);
    });

    it('refuses a move into the folder the page is already in', async () => {
      const result = await asUser(() => service.moveDoc(DOC_ID, GUIDES_ID));

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.reason).toContain('already in that folder');
      expect(calls).toEqual([]);
    });

    /**
     * Refused before the tree operation is called, not by catching its refusal: that one is raised
     * after it has renumbered the siblings of both folders, one save each and no transaction, so a
     * refusal from there would sit on top of a half-done move.
     */
    it('refuses, before writing anything, a move into a folder that holds the same title', async () => {
      const nested = folders.get(NESTED_ID) as HnFolder;
      nested.documentations = [buildDoc('doc-twin', nested, 'Getting started')];

      const result = await asUser(() => service.moveDoc(DOC_ID, NESTED_ID));

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.reason).toContain('already holds a page or a folder called "Getting started"');
      expect(result.reason).toContain('Nothing was moved');
      expect(calls).toEqual([]);
    });

    /**
     * A move recomputes the path from the title it finds, and a title the slug leaves nothing of
     * would give the page a url no one can reach. Such a title can predate this tool — the site and
     * the CLI both accept one.
     */
    it('refuses moving a page whose own title produces no url segment', async () => {
      const guides = folders.get(GUIDES_ID) as HnFolder;
      docs.set(DOC_ID, buildDoc(DOC_ID, guides, '!!!'));

      const result = await asUser(() => service.moveDoc(DOC_ID, NESTED_ID));

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.reason).toContain('Rename it first');
      expect(calls).toEqual([]);
    });

    /**
     * A move a model can ask for and the site's tree widget cannot: it would carry the page out of
     * the tree its author was checked against, so nothing below this guards against it.
     */
    it('refuses a move into another brick version', async () => {
      const result = await asUser(() => service.moveDoc(DOC_ID, OTHER_VERSION_FOLDER_ID));

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.reason).toContain('another brick, or to another version');
      expect(calls).toEqual([]);
    });
  });

  describe('deleting a page', () => {
    it('refuses without confirm, and deletes nothing', async () => {
      const result = await asUser(() => service.deleteDoc(DOC_ID, false));

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.reason).toContain('was not confirmed');
      expect(calls).toEqual([]);
      expect(docs.has(DOC_ID)).toBe(true);
    });

    it('deletes with confirm, and describes what is gone', async () => {
      const result = await asUser(() => service.deleteDoc(DOC_ID, true));

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.deleted.id).toBe(DOC_ID);
      expect(result.deleted.title).toBe('Getting started');
      expect(calls).toEqual([`removeDoc(${DOC_ID})`]);
      expect(docs.has(DOC_ID)).toBe(false);
    });

    /**
     * No refusal conditional on what the page holds. A tool that refused to delete the pages it
     * judges valuable would be refusing exactly the deletions that matter.
     */
    it('does not weigh what the page holds before deleting it', async () => {
      docs.set(DOC_ID, buildDoc(DOC_ID, folders.get(GUIDES_ID) as HnFolder, 'The whole reference'));

      const result = await asUser(() => service.deleteDoc(DOC_ID, true));

      expect(result.ok).toBe(true);
    });
  });

  describe('folders', () => {
    it('creates one inside another', async () => {
      const result = await asUser(() => service.createFolder(ROOT_ID, 'Reference'));

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.node.type).toBe('folder');
      expect(calls).toEqual([`createFolder(${ROOT_ID},Reference)`]);
    });

    it('renames one, warning that every url below it followed', async () => {
      const result = await asUser(() => service.renameFolder(GUIDES_ID, 'Handbook'));

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.note).toContain('every page and folder under it');
      expect(calls).toEqual([`updateFolder(${GUIDES_ID},Handbook)`]);
    });

    it('moves one, through the tree operation the site uses', async () => {
      const result = await asUser(() => service.moveFolder(NESTED_ID, ROOT_ID));

      expect(result.ok).toBe(true);
      expect(calls).toEqual([
        `updateNodeLocation(${NESTED_ID},${HnNodeType.FOLDER},0->0,${GUIDES_ID}->${ROOT_ID},main=${ROOT_ID})`,
      ]);
    });

    /**
     * The move that detaches a branch from the root. The read tools then refuse to return the tree
     * at all, so the whole brick's documentation becomes unbrowsable — and the site's tree widget
     * cannot even express it, so nothing below this guards against it.
     */
    it('refuses moving a folder into its own sub-folder', async () => {
      const result = await asUser(() => service.moveFolder(GUIDES_ID, NESTED_ID));

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.reason).toContain('inside itself or inside one of its own sub-folders');
      expect(calls).toEqual([]);
    });

    /**
     * The cycle check walks a bounded number of ancestors. Running out of that bound has to refuse
     * rather than pass: a chain that long either was never meant to exist or already holds a cycle,
     * and answering "no cycle" because the question could not be settled would let through exactly
     * the move the check exists to stop.
     */
    it('refuses a move it cannot verify, rather than allowing it', async () => {
      let parentId = ROOT_ID;
      for (let depth = 0; depth < 60; depth++) {
        const deep = buildFolder(`folder-deep-${depth}`, parentId, `Deep ${depth}`, `deep${depth}/`);
        folders.set(deep.id, deep);
        parentId = deep.id;
      }

      const result = await asUser(() => service.moveFolder(GUIDES_ID, parentId));

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.reason).toContain('cannot be established');
      expect(calls).toEqual([]);
    });

    it('refuses moving a folder into itself', async () => {
      const result = await asUser(() => service.moveFolder(GUIDES_ID, GUIDES_ID));

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.reason).toContain('inside itself');
      expect(calls).toEqual([]);
    });

    it('refuses renaming or moving the root folder of a brick version', async () => {
      const renamed = await asUser(() => service.renameFolder(ROOT_ID, 'Documentation'));
      const moved = await asUser(() => service.moveFolder(ROOT_ID, GUIDES_ID));

      expect(renamed.ok).toBe(false);
      expect(moved.ok).toBe(false);
      if (renamed.ok || moved.ok) return;
      expect(renamed.reason).toContain('root of the brick version');
      expect(moved.reason).toContain('root of the brick version');
      expect(calls).toEqual([]);
    });

    /**
     * There is deliberately no folder deletion: it is recursive and takes the pages under it with
     * their files, so a model that deletes a folder does not lose a page, it loses a branch. Asserted
     * rather than commented, because the tool that adds one would be one line.
     */
    it('exposes no way to delete a folder', () => {
      const operations = Object.getOwnPropertyNames(HnMcpDocStructureService.prototype);

      expect(operations.filter((name) => /folder/i.test(name) && /delete|remove/i.test(name))).toEqual([]);
    });
  });

  describe('who may change the tree', () => {
    it.each([
      ['createDoc', (): Promise<{ ok: boolean }> => service.createDoc(GUIDES_ID, 'Installation')],
      ['renameDoc', (): Promise<{ ok: boolean }> => service.renameDoc(DOC_ID, 'Other')],
      ['moveDoc', (): Promise<{ ok: boolean }> => service.moveDoc(DOC_ID, NESTED_ID)],
      ['deleteDoc', (): Promise<{ ok: boolean }> => service.deleteDoc(DOC_ID, true)],
      ['createFolder', (): Promise<{ ok: boolean }> => service.createFolder(ROOT_ID, 'Reference')],
      ['renameFolder', (): Promise<{ ok: boolean }> => service.renameFolder(GUIDES_ID, 'Handbook')],
      ['moveFolder', (): Promise<{ ok: boolean }> => service.moveFolder(NESTED_ID, ROOT_ID)],
    ])('refuses %s for a user who is neither the author nor a co-author', async (_name, run) => {
      authorized = false;

      const result = (await asUser(run)) as { ok: boolean; reason?: string };

      expect(result.ok).toBe(false);
      expect(result.reason).toContain('neither the author nor a co-author');
      expect(result.reason).toContain('gws_core');
      expect(calls).toEqual([]);
    });

    /**
     * The check reads the brick's co-authors from the database. Reporting a timeout as "you are not
     * the author" would send the caller off to ask for rights it already has instead of trying
     * again, so only the verdict becomes a refusal.
     */
    it('does not pass a failure inside the check off as a permission denial', async () => {
      securityFailure = new Error('the connection dropped');

      await expect(asUser(() => service.createDoc(GUIDES_ID, 'Installation'))).rejects.toThrow(
        'the connection dropped'
      );
      expect(calls).toEqual([]);
    });
  });
});
