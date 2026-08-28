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

/////////////////////////// THE CLAUDE CODE PLUGIN ///////////////////////////
//
// The four strings a client needs to install the plugin that drives this endpoint, served by
// `HnMcpDocInstallController`. Every one of them exists somewhere else too, and each fails
// differently when the two drift.
//
// `check_plugin_constants.sh` compares the two that come from the plugin manifest against it
// on every pull request touching either side. The marketplace pair cannot be checked from this
// repository — it is published in another one — which is why only these two are.
//
// The Space API declares the same four for its own plugin. Duplicated rather than shared for
// the same reason as the path above: two deployables, neither building the other's code. Only
// the two marketplace values are actually equal, and they are equal by coincidence of both
// plugins being published to one marketplace, not by anything that would keep them so.

/**
 * Repository the marketplace is added from: `claude plugin marketplace add <this>`.
 *
 * The safe one of the four: a wrong value fails loudly at the first command, before anything
 * is installed.
 */
export const HN_MCP_PLUGIN_MARKETPLACE_REPO = 'Constellab/agent-plugins';

/**
 * `name` in that repository's `marketplace.json` — the `constellab` of `community@constellab`.
 *
 * Not the repository name, despite the resemblance, and not this application's name either. A
 * client that has the marketplace registered under a different name gets plugin-not-found,
 * which reads exactly like a plugin that was never published.
 */
export const HN_MCP_PLUGIN_MARKETPLACE_NAME = 'constellab';

/**
 * The plugin that carries the skills for this endpoint: `name` in
 * `claude-plugin/community/.claude-plugin/plugin.json`, and `plugin_name` in
 * `publish-community-plugin.yml`.
 *
 * One plugin per MCP endpoint, named after the API rather than any one toolset: two plugins
 * declaring the same MCP server would make a client connect to it twice and list every tool
 * twice. So a second Community toolset joins this plugin instead of getting its own.
 */
export const HN_MCP_PLUGIN_NAME = 'community';

/**
 * The `userConfig` key the plugin declares for this API's base URL, passed as
 * `--config <this>=<apiUrl>` at install time.
 *
 * The quiet failure of the four: the CLI rejects a key the manifest does not declare, and the
 * message names the flag rather than the plugin, so it reads as a bad command line rather than
 * as a value this API produced.
 */
export const HN_MCP_PLUGIN_API_URL_CONFIG_KEY = 'community_api_url';
