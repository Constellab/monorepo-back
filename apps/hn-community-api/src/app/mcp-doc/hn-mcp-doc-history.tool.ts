import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';

import { HnMcpDocHistoryService } from './hn-mcp-doc-history.service';
import { HnMcpToolResponse, HnMcpToolResponseHelper } from './hn-mcp-tool-response.helper';

/**
 * The undo of the Community documentation MCP: what happened to a page, and putting it back.
 *
 * It exists so that the write tools can exist. A model editing documentation will get something
 * wrong, and the question is whether repairing it needs the site's UI — which the person working
 * with the model may not have open — or one more tool call.
 */
@Injectable()
export class HnMcpDocHistoryTool {
  constructor(private readonly historyService: HnMcpDocHistoryService) {}

  @Tool({
    name: 'community_doc_history',
    description:
      'Read what happened to a documentation page: one entry per recorded action — an edit through ' +
      'this MCP, a save in the editor, a CLI push, an earlier rollback — newest first, with who did ' +
      'it, when, and which blocks it touched. Each entry carries a "modificationId" that ' +
      'community_doc_rollback takes. Use it to find what to undo, and to check what an edit of yours ' +
      'actually recorded. Only the author or a co-author of the brick can read it: it holds the ' +
      'earlier content of blocks, which the public page does not.',
    annotations: { readOnlyHint: true },
    parameters: z.object({
      docId: z.string().min(1).describe('The documentation page id.'),
      limit: z
        .number()
        .int()
        .min(1)
        .max(HnMcpDocHistoryService.MAX_ENTRIES)
        .default(HnMcpDocHistoryService.DEFAULT_ENTRIES)
        .describe('How many entries to return, newest first.'),
    }),
  })
  async history({ docId, limit }: { docId: string; limit: number }): Promise<HnMcpToolResponse> {
    return HnMcpToolResponseHelper.fromResult(await this.historyService.history(docId, limit));
  }

  @Tool({
    name: 'community_doc_rollback',
    description:
      'Put a documentation page back to the state it was in before one entry of its history, ' +
      'undoing every entry recorded after that one as well — the modificationId names how far back ' +
      'to go, from community_doc_history. Nothing is lost: the rollback is recorded as an edit like ' +
      'any other, so it appears in the history and can itself be rolled back. It is refused if ' +
      'someone wrote to the page while it was being prepared, so it never quietly undoes a change ' +
      'you have not seen. This restores content only — it does not bring back a deleted page, and it ' +
      'does not undo a rename or a move. Only the author or a co-author of the brick can roll back ' +
      'its documentation.',
    annotations: { destructiveHint: false, idempotentHint: false, readOnlyHint: false },
    parameters: z.object({
      docId: z.string().min(1).describe('The documentation page id.'),
      modificationId: z
        .string()
        .min(1)
        .describe('The "modificationId" of the history entry to come back to, from community_doc_history.'),
    }),
  })
  async rollback({
    docId,
    modificationId,
  }: {
    docId: string;
    modificationId: string;
  }): Promise<HnMcpToolResponse> {
    return HnMcpToolResponseHelper.fromResult(await this.historyService.rollback(docId, modificationId));
  }
}
