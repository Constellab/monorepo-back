import { z } from 'zod';

import {
  CN_MCP_SPACE_REQUIRED_MESSAGE,
  CN_MCP_TOOL_GET_DEFAULT_SPACE,
  CN_MCP_TOOL_LIST_SPACES,
} from './cn-mcp.constants';

/** The shape @rekog/mcp-nest expects a tool handler to return. */
export type CnMcpToolResponse = {
  content: {
    type: 'text';
    text: string;
  }[];
  isError?: boolean;
};

/**
 * The Space parameter every Space-scoped tool takes.
 *
 * Required rather than defaulted, per ADR-0003: a silent default would let a model operate on a
 * Space the user never confirmed, with nothing in the conversation revealing which one. The
 * validation message is the same sentence the runtime refusal uses, so a client that omits the
 * argument and a client that sends a blank one both learn which tool to call next.
 *
 * Shared between every tool class rather than redefined per file: the sentence a model reads
 * when it forgets the Space is part of the server's contract, and two copies of it drift.
 */
export const CN_MCP_SPACE_ID_PARAMETER = z
  .string({ error: CN_MCP_SPACE_REQUIRED_MESSAGE })
  .min(1, { error: CN_MCP_SPACE_REQUIRED_MESSAGE })
  .describe(
    `Id of the Space to act in. Required — this server has no current Space. Obtain it from ` +
      `${CN_MCP_TOOL_GET_DEFAULT_SPACE} or ${CN_MCP_TOOL_LIST_SPACES}; never invent one.`
  );

/** Wrap a payload as the single text block a tool answers with. */
export function cnMcpJson(payload: unknown): CnMcpToolResponse {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(payload, null, 2) }],
  };
}
