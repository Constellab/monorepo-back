import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';

import { HnMcpDocService } from './hn-mcp-doc.service';
import { HnMcpToolResponse, HnMcpToolResponseHelper } from './hn-mcp-tool-response.helper';

/**
 * MCP tools exposing the community documentation (read-only).
 *
 * Discovered automatically by @rekog/mcp-nest and served on the MCP HTTP endpoint
 * configured in {@link HnMcpDocModule}.
 */
@Injectable()
export class HnMcpDocTool {
  constructor(private readonly docService: HnMcpDocService) {}

  @Tool({
    name: 'community_doc_search',
    description:
      'Search the Constellab community documentation by keyword (matches title and body). ' +
      'Covers the Constellab product documentation and the technical documentation of its bricks, ' +
      'notably gws_core — how to develop in Constellab (tasks, protocols, resources, views, Python API). ' +
      'Returns a list of matching docs with a text snippet, their brick, version and path. ' +
      'Use community_doc_read with the returned id to get the full content.',
    parameters: z.object({
      query: z.string().min(1).describe('Keyword(s) to search for in the documentation.'),
      limit: z.number().int().min(1).max(50).default(10).describe('Maximum number of results.'),
    }),
  })
  async search({ query, limit }: { query: string; limit: number }): Promise<HnMcpToolResponse> {
    const results = await this.docService.search(query, limit);
    return HnMcpToolResponseHelper.asJson({ count: results.length, results });
  }

  @Tool({
    name: 'community_doc_list',
    description:
      'List community documentation pages, optionally filtered by brick name. ' +
      'Useful to browse what documentation exists before reading a specific page — for instance ' +
      'brickName "gws_core" for the technical documentation on developing in Constellab.',
    parameters: z.object({
      brickName: z
        .string()
        .optional()
        .describe('Optional case-insensitive substring of the brick name to filter by.'),
      limit: z.number().int().min(1).max(200).default(50).describe('Maximum number of results.'),
    }),
  })
  async list({ brickName, limit }: { brickName?: string; limit: number }): Promise<HnMcpToolResponse> {
    const results = await this.docService.list(brickName, limit);
    return HnMcpToolResponseHelper.asJson({ count: results.length, results });
  }

  @Tool({
    name: 'community_doc_read',
    description:
      'Read a single community documentation page rendered as markdown, given its id ' +
      '(obtained from community_doc_search or community_doc_list).',
    parameters: z.object({
      id: z.string().min(1).describe('The documentation page id.'),
    }),
  })
  async read({ id }: { id: string }): Promise<HnMcpToolResponse> {
    const doc = await this.docService.read(id);
    if (doc == null) {
      return HnMcpToolResponseHelper.asError(`No documentation found for id "${id}".`);
    }
    const header = [
      `# ${doc.title}`,
      doc.brickName ? `**Brick:** ${doc.brickName}${doc.version ? ` (${doc.version})` : ''}` : null,
      `**Path:** ${doc.completePath}`,
      '',
    ]
      .filter((line) => line != null)
      .join('\n');

    return {
      content: [{ type: 'text' as const, text: `${header}\n${doc.markdown}` }],
    };
  }

  @Tool({
    name: 'community_doc_tree',
    description:
      'Get the folder and page tree of one brick version, with the id of every folder and every page. ' +
      'This is the only tool that returns a folder id, so it is a prerequisite of creating a page. ' +
      'Use it once you know which brick you are working in; community_doc_list is the tool for finding ' +
      'that out across bricks. Refuses rather than truncating if the tree is too large to return whole.',
    parameters: z.object({
      brickName: z.string().min(1).describe('Exact name of the brick, for instance "gws_core".'),
      version: z
        .string()
        .optional()
        .describe(
          'Version as the listing tools return it ("latest", "v2"); a full "2.1.0" is accepted too ' +
            'and read as its major. Omit for the latest.'
        ),
    }),
  })
  async tree({ brickName, version }: { brickName: string; version?: string }): Promise<HnMcpToolResponse> {
    const result = await this.docService.tree(brickName, version);
    if (!result.ok) {
      return HnMcpToolResponseHelper.asError(result.reason);
    }
    return HnMcpToolResponseHelper.asJson(result.tree);
  }

  @Tool({
    name: 'community_doc_read_blocks',
    description:
      'Read a page as the raw EditorJS blocks it is stored as — block ids included — plus the ' +
      'revision of its content. Use this, not community_doc_read, before editing a page: the markdown ' +
      'rendering loses the block ids the modification history is matched on. ' +
      'A block marked "editable": false can be moved or deleted but never rewritten, and its "summary" ' +
      'says what it holds and why. Send the "revision" back when writing: the write is refused if the ' +
      'page changed in the meantime.',
    parameters: z.object({
      docId: z.string().min(1).describe('The documentation page id.'),
    }),
  })
  async readBlocks({ docId }: { docId: string }): Promise<HnMcpToolResponse> {
    const doc = await this.docService.readBlocks(docId);
    if (doc == null) {
      return HnMcpToolResponseHelper.asError(`No documentation found for id "${docId}".`);
    }
    return HnMcpToolResponseHelper.asJson(doc);
  }
}
