/**
 * Path of the community documentation MCP, relative to this application's base URL.
 *
 * Lives with the MCP rather than with the OAuth wiring because it is where the endpoint
 * is mounted: `HnMcpDocModule` serves it, and `HnAppModule` registers it as a Resource so
 * the audience of a token and the URL a client calls cannot drift apart.
 */
export const HN_MCP_COMMUNITY_DOC_RESOURCE_PATH = 'mcp/community-doc';
