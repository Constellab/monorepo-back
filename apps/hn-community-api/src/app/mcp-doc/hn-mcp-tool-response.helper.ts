/** The shape @rekog/mcp-nest expects a tool handler to return. */
export interface HnMcpToolResponse {
  content: {
    type: 'text';
    text: string;
  }[];
  isError?: boolean;
}

/** Anything the write services return: a success or a refusal, told apart by `ok`. */
interface HnMcpOkOrRefusal {
  ok: boolean;
}

/**
 * Turning a service result into what the transport sends.
 *
 * One place rather than one per tool, because the mapping carries a decision: a refusal goes back as
 * the same JSON as a success, with `isError` set, instead of as a sentence. Refusals here carry
 * values the caller acts on — a new revision, the blocks that changed, the id of what was created —
 * and prose would strip them. `isError` is what tells the model the operation did not happen.
 */
export class HnMcpToolResponseHelper {
  /** A result whose `ok` decides whether this is an error response. */
  static fromResult(result: HnMcpOkOrRefusal): HnMcpToolResponse {
    return { ...HnMcpToolResponseHelper.asJson(result), ...(result.ok ? {} : { isError: true }) };
  }

  /** A payload that is not a result: read tools that cannot refuse. */
  static asJson(payload: unknown): HnMcpToolResponse {
    return { content: [{ type: 'text' as const, text: JSON.stringify(payload, null, 2) }] };
  }

  /** A refusal that has no result object behind it — an unknown id, a page that is not there. */
  static asError(message: string): HnMcpToolResponse {
    return { content: [{ type: 'text' as const, text: message }], isError: true };
  }
}
