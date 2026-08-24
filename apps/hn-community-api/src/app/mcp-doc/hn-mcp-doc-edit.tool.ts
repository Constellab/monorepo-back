import { TeBlockType, TeRichTextOperations } from '@monorepo/te-text-editor';
import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';

import { HnMcpDocEditService } from './hn-mcp-doc-edit.service';

/** The shape @rekog/mcp-nest expects a tool handler to return. */
type HnMcpToolResponse = {
  content: {
    type: 'text';
    text: string;
  }[];
  isError?: boolean;
};

/**
 * One operation of a batch, flat: `op` picks which of the other fields matter.
 *
 * Flat rather than a discriminated union because this schema is rendered as JSON Schema by every
 * MCP client, and a union renders differently in each. The combinations are checked server-side
 * instead, in `TeRichTextOperations`, where a refusal can name the field that is wrong — which is
 * more use to a model than a schema it cannot satisfy.
 */
const HN_MCP_DOC_OPERATION = z.object({
  op: z
    .enum(['update', 'insert', 'delete', 'move'])
    .describe(
      'update: replace the data of a block. insert: add a new block. delete: remove a block. ' +
        'move: put an existing block somewhere else.'
    ),
  blockId: z
    .string()
    .optional()
    .describe('The block to update, delete or move. Never set on an insert: the server mints the id.'),
  type: z
    .enum(Object.values(TeBlockType) as [string, ...string[]])
    .optional()
    .describe(
      'The type of the block to insert. Never set on an update: changing the type of a block is a ' +
        'delete followed by an insert. figure, resourceView and fileView cannot be inserted — they ' +
        'are filled from an upload or from a lab.'
    ),
  data: z
    .record(z.string(), z.any())
    .optional()
    .describe(
      'The complete EditorJS data of the block, for insert and update — never a partial patch, it ' +
        'replaces what was there. Use the shape community_doc_read_blocks returns for that type.'
    ),
  before: z.string().optional().describe('Position: immediately before this block id.'),
  after: z.string().optional().describe('Position: immediately after this block id.'),
  at: z.enum(['start', 'end']).optional().describe('Position: at the start or the end of the page.'),
});

/**
 * The write tool of the Community documentation MCP.
 *
 * Separate from the read tools so the read service stays read-only, and separate from the chatbot
 * tool for the same reason: all three are registered on the one MCP server the plugin declares.
 */
@Injectable()
export class HnMcpDocEditTool {
  constructor(private readonly editService: HnMcpDocEditService) {}

  @Tool({
    name: 'community_doc_edit',
    description:
      'Edit a community documentation page by operations on its blocks. Read the page with ' +
      'community_doc_read_blocks first: every blockId and the revision come from there. ' +
      'Untouched blocks are kept exactly as they are, id included, so the page keeps its ' +
      'modification history — which is why this tool takes operations and not a whole document. ' +
      'The whole batch is one entry in the page history, and it is all-or-nothing: one bad ' +
      'operation refuses the batch and writes nothing. Positions ("before", "after", "at") are ' +
      'read against the page as you read it, not against the state left by the previous operation, ' +
      'so describe every change against what community_doc_read_blocks returned. Anchor on a block ' +
      'the same batch does not move or delete. The ids of inserted blocks are minted by the server ' +
      'and returned in the response, which carries the touched blocks only — not the whole page. ' +
      'Only the author or a co-author of the brick can edit its documentation.',
    parameters: z.object({
      docId: z.string().min(1).describe('The documentation page id.'),
      revision: z
        .string()
        .min(1)
        .describe(
          'The revision community_doc_read_blocks returned for this page. The edit is refused if ' +
            'the page changed since, and the refusal names the blocks that changed.'
        ),
      operations: z
        .array(HN_MCP_DOC_OPERATION)
        .min(1)
        .max(TeRichTextOperations.MAX_OPERATIONS)
        .describe(
          `The operations to apply, at most ${TeRichTextOperations.MAX_OPERATIONS} of them. ` +
            'Split a longer edit into several batches — each batch is one entry in the page history.'
        ),
    }),
  })
  async edit({
    docId,
    revision,
    operations,
  }: {
    docId: string;
    revision: string;
    operations: z.infer<typeof HN_MCP_DOC_OPERATION>[];
  }): Promise<HnMcpToolResponse> {
    const result = await this.editService.edit(docId, revision, operations);
    if (!result.ok) {
      // The refusal goes back as JSON rather than as a sentence: a stale revision carries the new
      // revision and the blocks that changed, and those are values the caller acts on, not prose.
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }], isError: true };
    }
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  }
}
