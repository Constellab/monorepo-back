import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';

import { HnMcpDocStructureService } from './hn-mcp-doc-structure.service';
import { HnMcpToolResponse, HnMcpToolResponseHelper } from './hn-mcp-tool-response.helper';

/**
 * The one sentence every tool here repeats. Duplicated into each description on purpose: a client
 * shows a model one tool description at a time, and a rights requirement stated only in the server
 * instructions is a requirement the model discovers by being refused.
 */
const RIGHTS = 'Only the author or a co-author of the brick can change its documentation.';

/**
 * The tree tools of the Community documentation MCP: pages and folders, created, renamed and moved.
 *
 * Separate from {@link HnMcpDocEditTool}, which writes the blocks of one page, because they are two
 * different things to get wrong: this one changes where a page is and what it is called, that one
 * changes what it says. Both are registered on the one MCP server the plugin declares.
 */
@Injectable()
export class HnMcpDocStructureTool {
  constructor(private readonly structureService: HnMcpDocStructureService) {}

  @Tool({
    name: 'community_doc_create',
    description:
      'Create a new documentation page in a folder. The page is created EMPTY: write its content ' +
      'afterwards with community_doc_edit, which is the only tool that writes page content. ' +
      'The folderId comes from community_doc_tree, the only tool that returns one. The title ' +
      'becomes the last segment of the page url, and a folder cannot hold two pages with the same ' +
      'title. ' +
      RIGHTS,
    parameters: z.object({
      folderId: z.string().min(1).describe('The folder to create the page in, from community_doc_tree.'),
      title: z
        .string()
        .min(1)
        .describe(
          'The title of the page. The url segment is derived from it, so it needs a letter or digit.'
        ),
    }),
  })
  async create({ folderId, title }: { folderId: string; title: string }): Promise<HnMcpToolResponse> {
    return HnMcpToolResponseHelper.fromResult(await this.structureService.createDoc(folderId, title));
  }

  @Tool({
    name: 'community_doc_rename',
    description:
      'Rename a documentation page. This changes its url as well, because the url is built from the ' +
      'title — links to the old url stop resolving. The content is untouched. ' +
      RIGHTS,
    parameters: z.object({
      docId: z.string().min(1).describe('The documentation page id.'),
      title: z.string().min(1).describe('The new title.'),
    }),
  })
  async rename({ docId, title }: { docId: string; title: string }): Promise<HnMcpToolResponse> {
    return HnMcpToolResponseHelper.fromResult(await this.structureService.renameDoc(docId, title));
  }

  @Tool({
    name: 'community_doc_move',
    description:
      'Move a documentation page into another folder, at the end of it. The page keeps its title ' +
      'and content, and its url changes with its folder. The target folder must be in the same ' +
      'brick version: a page never moves to another brick or another version. ' +
      RIGHTS,
    parameters: z.object({
      docId: z.string().min(1).describe('The documentation page id.'),
      folderId: z.string().min(1).describe('The folder to move it into, from community_doc_tree.'),
    }),
  })
  async move({ docId, folderId }: { docId: string; folderId: string }): Promise<HnMcpToolResponse> {
    return HnMcpToolResponseHelper.fromResult(await this.structureService.moveDoc(docId, folderId));
  }

  @Tool({
    name: 'community_doc_delete',
    description:
      'Delete a documentation page and the files attached to it. This is final: community_doc_rollback ' +
      'undoes edits to a page that still exists, and brings nothing back after this. Requires ' +
      'confirm: true, which is there so a human agrees to the deletion first — ask, then call. ' +
      RIGHTS,
    // The client is told this tool destroys data so it can ask a human before it runs. The server
    // asks for `confirm` as well rather than trusting the annotation: an annotation is a hint a
    // client is free to ignore, and this is the one operation with nothing behind it.
    annotations: { destructiveHint: true, idempotentHint: false, readOnlyHint: false },
    parameters: z.object({
      docId: z.string().min(1).describe('The documentation page id.'),
      confirm: z
        .boolean()
        .describe(
          'Must be true. Set it only once the person you are working with has agreed to this page ' +
            'being deleted; the deletion cannot be undone.'
        ),
    }),
  })
  async delete({ docId, confirm }: { docId: string; confirm: boolean }): Promise<HnMcpToolResponse> {
    return HnMcpToolResponseHelper.fromResult(await this.structureService.deleteDoc(docId, confirm));
  }

  @Tool({
    name: 'community_folder_create',
    description:
      'Create a folder inside another folder of a brick version. Folder ids come from ' +
      'community_doc_tree. The title becomes a segment of the url of everything under it, and a ' +
      'folder cannot hold two children with the same title. There is no tool to delete a folder: ' +
      'a folder deletion is recursive and would take the pages under it with it. ' +
      RIGHTS,
    parameters: z.object({
      folderId: z
        .string()
        .min(1)
        .describe('The parent folder, from community_doc_tree. Use its "root" folder for a top-level one.'),
      title: z.string().min(1).describe('The title of the folder.'),
    }),
  })
  async createFolder({ folderId, title }: { folderId: string; title: string }): Promise<HnMcpToolResponse> {
    return HnMcpToolResponseHelper.fromResult(await this.structureService.createFolder(folderId, title));
  }

  @Tool({
    name: 'community_folder_rename',
    description:
      'Rename a folder. The url of every page and folder under it changes with it, so links to the ' +
      'old urls stop resolving. The root folder of a brick version cannot be renamed. ' +
      RIGHTS,
    parameters: z.object({
      folderId: z.string().min(1).describe('The folder id, from community_doc_tree.'),
      title: z.string().min(1).describe('The new title.'),
    }),
  })
  async renameFolder({ folderId, title }: { folderId: string; title: string }): Promise<HnMcpToolResponse> {
    return HnMcpToolResponseHelper.fromResult(await this.structureService.renameFolder(folderId, title));
  }

  @Tool({
    name: 'community_folder_move',
    description:
      'Move a folder into another folder of the same brick version, at the end of it. Everything ' +
      'under it moves with it and its urls change. A folder cannot be moved into itself or into one ' +
      'of its own sub-folders, and the root folder of a brick version cannot be moved. ' +
      RIGHTS,
    parameters: z.object({
      folderId: z.string().min(1).describe('The folder to move, from community_doc_tree.'),
      parentFolderId: z.string().min(1).describe('The folder to move it into, from community_doc_tree.'),
    }),
  })
  async moveFolder({
    folderId,
    parentFolderId,
  }: {
    folderId: string;
    parentFolderId: string;
  }): Promise<HnMcpToolResponse> {
    return HnMcpToolResponseHelper.fromResult(
      await this.structureService.moveFolder(folderId, parentFolderId)
    );
  }
}
