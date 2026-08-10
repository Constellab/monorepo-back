/**
 * Path of this application's MCP endpoint, relative to its base URL.
 *
 * Lives with the MCP rather than with the OAuth wiring because it is where the endpoint is
 * mounted: `CnMcpModule` serves it, and `CnAppModule` registers it as a Resource so the
 * audience of a token and the URL a client calls cannot drift apart.
 *
 * Named after the application, not after a Space. Per ADR-0003 the Space is a tool
 * parameter, so this one path answers for every Space the caller belongs to and the
 * expected audience is the same string whichever one they name.
 */
export const CN_MCP_SPACE_API_RESOURCE_PATH = 'mcp/space-api';

/** Tool that answers "which Space would you use if I do not say". */
export const CN_MCP_TOOL_GET_DEFAULT_SPACE = 'constellab_get_default_space';

/** Tool that turns a Space name a user said out loud into an id a tool can take. */
export const CN_MCP_TOOL_LIST_SPACES = 'constellab_list_spaces';

/**
 * What a Space-scoped tool says when it is called without a Space.
 *
 * Names the two tools that produce a Space id, because an MCP server cannot prompt before
 * it is called: the only way a model learns what to do next is the text it gets back.
 * Used both as the schema's validation message — which is what a client sees when the
 * parameter is absent altogether — and as the runtime refusal for a blank one.
 */
export const CN_MCP_SPACE_REQUIRED_MESSAGE =
  `A Space id is required on every Space-scoped tool: this server remembers no current Space. ` +
  `Call ${CN_MCP_TOOL_GET_DEFAULT_SPACE} for the Space the user last worked in, or ` +
  `${CN_MCP_TOOL_LIST_SPACES} to resolve a Space they named, tell the user which Space you are ` +
  `using, then call again with its id.`;
