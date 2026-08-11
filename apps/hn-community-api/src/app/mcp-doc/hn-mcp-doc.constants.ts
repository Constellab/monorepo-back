/**
 * Path of the community documentation MCP, relative to this application's base URL.
 *
 * Lives with the MCP rather than with the OAuth wiring because it is where the endpoint
 * is mounted: `HnMcpDocModule` serves it, and `HnAppModule` registers it as a Resource so
 * the audience of a token and the URL a client calls cannot drift apart.
 *
 * The Space API holds the same string as `CN_MCP_COMMUNITY_DOC_RESOURCE_PATH`, because per
 * ADR-0001 it is the Authorization Server that mints tokens for this Resource and it cannot
 * import from here. Changing this path means changing that one in the same commit.
 */
export const HN_MCP_COMMUNITY_DOC_RESOURCE_PATH = 'mcp/community-doc';
