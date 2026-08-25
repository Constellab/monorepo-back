import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';

import { HnCoreConfigService } from '../core/modules/core-config/hn-core-config.service';
import { HnRagflowChatbotService } from '../ragflow-chatbot/hn-ragflow-chatbot.service';
import { HnMcpToolResponse, HnMcpToolResponseHelper } from './hn-mcp-tool-response.helper';

/**
 * MCP tool putting a question to the community documentation chatbot (Ragflow RAG).
 *
 * Complements {@link HnMcpDocTool}: that one is lexical (a `LIKE` over titles and bodies),
 * this one is semantic, and answers a question instead of returning pages. Registered on the
 * same MCP server so both toolsets ship in the one Community plugin.
 *
 * The MCP endpoint is stateless, so the Ragflow session is carried by the client: the first
 * call creates one and returns its id, and passing that id back keeps the conversation
 * context on Ragflow's side.
 */
@Injectable()
export class HnMcpChatbotTool {
  private readonly logger = new Logger(HnMcpChatbotTool.name);

  /** References are meant to be citable, not readable — the full chunk belongs in community_doc_read. */
  private static readonly SNIPPET_LENGTH = 400;

  constructor(
    private readonly coreConfigService: HnCoreConfigService,
    private readonly ragflowService: HnRagflowChatbotService
  ) {}

  @Tool({
    name: 'community_doc_ask',
    description:
      'Ask the Constellab documentation chatbot a question in natural language. ' +
      'It answers from the community documentation (RAG) and cites the source documents it used. ' +
      'That documentation covers both the Constellab product (what it does, how to use the platform) ' +
      'and the technical documentation of its bricks, notably gws_core — how to develop in Constellab: ' +
      'writing tasks, protocols, resources, views and the Python API. ' +
      'Prefer this over community_doc_search when the question is conceptual ' +
      '("how do I ...", "what is ..."); ' +
      'prefer community_doc_search when looking for a page by an exact keyword or name. ' +
      'Pass back the returned sessionId to ask a follow-up in the same conversation.',
    parameters: z.object({
      question: z.string().min(1).describe('The question to ask, in natural language.'),
      sessionId: z
        .string()
        .optional()
        .describe(
          'Session id returned by a previous call, to continue that conversation. Omit to start a new one.'
        ),
    }),
  })
  async ask({ question, sessionId }: { question: string; sessionId?: string }): Promise<HnMcpToolResponse> {
    const chatId = this.coreConfigService.getRagflowChatId();
    if (!chatId) {
      return HnMcpToolResponseHelper.asError(
        'The documentation chatbot is not available on this server. Use community_doc_search instead.'
      );
    }

    try {
      const session = sessionId ?? (await this.ragflowService.createSession(chatId));
      const message = await this.ragflowService.sendMessage(chatId, question, session);

      return HnMcpToolResponseHelper.asJson({
        answer: message.content,
        sessionId: session,
        references: (message.references ?? []).map((reference) => ({
          documentName: reference.documentName,
          score: reference.score,
          snippet: this.truncate(reference.content),
        })),
      });
    } catch (error) {
      this.logger.error(`[ask] Chatbot call failed`, error);
      return HnMcpToolResponseHelper.asError(
        'The documentation chatbot could not answer this question. Use community_doc_search instead.'
      );
    }
  }

  private truncate(content: string): string {
    const plain = (content ?? '').replace(/\s+/g, ' ').trim();
    return plain.length > HnMcpChatbotTool.SNIPPET_LENGTH
      ? `${plain.slice(0, HnMcpChatbotTool.SNIPPET_LENGTH)}…`
      : plain;
  }
}
