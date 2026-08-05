import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';

import { HnMcpDocService } from './hn-mcp-doc.service';

/** The shape @rekog/mcp-nest expects a tool handler to return. */
type HnMcpToolResponse = {
  content: {
    type: 'text';
    text: string;
  }[];
  isError?: boolean;
};

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
      'Returns a list of matching docs with a text snippet, their brick, version and path. ' +
      'Use community_doc_read with the returned id to get the full content.',
    parameters: z.object({
      query: z.string().min(1).describe('Keyword(s) to search for in the documentation.'),
      limit: z.number().int().min(1).max(50).default(10).describe('Maximum number of results.'),
    }),
  })
  async search({ query, limit }: { query: string; limit: number }): Promise<HnMcpToolResponse> {
    const results = await this.docService.search(query, limit);
    return this.asJson({ count: results.length, results });
  }

  @Tool({
    name: 'community_doc_list',
    description:
      'List community documentation pages, optionally filtered by brick name. ' +
      'Useful to browse what documentation exists before reading a specific page.',
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
    return this.asJson({ count: results.length, results });
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
      return {
        content: [{ type: 'text' as const, text: `No documentation found for id "${id}".` }],
        isError: true,
      };
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

  private asJson(payload: unknown): HnMcpToolResponse {
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(payload, null, 2) }],
    };
  }
}
