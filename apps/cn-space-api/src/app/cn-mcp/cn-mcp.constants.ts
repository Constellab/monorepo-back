import { CnLabType } from '../cn-labs/cn-lab.entity';

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

/**
 * Path of the **Community API's** MCP endpoint, relative to the Community's base URL.
 *
 * Here because this application is the Authorization Server for the Community too
 * (ADR-0001): it has to recognize that Resource to mint a token for it, and it does not
 * serve it. Copied from `HN_MCP_COMMUNITY_DOC_RESOURCE_PATH` rather than imported — the two
 * applications are two deployables and neither builds the other's code — so this string and
 * that one must stay equal; a divergence reaches a user as `invalid_target` at `/authorize`
 * and nowhere earlier.
 */
export const CN_MCP_COMMUNITY_DOC_RESOURCE_PATH = 'mcp/community-doc';

/////////////////////////// THE CLAUDE CODE PLUGIN ///////////////////////////
//
// The four strings a client needs to install the plugin that drives this endpoint. They are
// the plugin's public identity, so they live beside the path it connects to: everything here
// exists somewhere else too, and each one fails differently when the two drift.
//
// `check_plugin_constants.sh` compares the two that come from the plugin manifest against it
// on every pull request touching either side. The marketplace pair cannot be checked from
// this repository — it is published in another one — which is why only these two are.

/**
 * Repository the marketplace is added from: `claude plugin marketplace add <this>`.
 *
 * Also the publish workflow's `PUBLIC_REPO`. The safe one of the four: a wrong value fails
 * loudly at the first command, before anything is installed.
 */
export const CN_MCP_PLUGIN_MARKETPLACE_REPO = 'Constellab/agent-plugins';

/**
 * `name` in that repository's `marketplace.json` — the `constellab` of `space@constellab`.
 *
 * Not the repository name, despite the resemblance, and not this application's name either.
 * A client that has the marketplace registered under a different name gets
 * plugin-not-found, which reads exactly like a plugin that was never published.
 */
export const CN_MCP_PLUGIN_MARKETPLACE_NAME = 'constellab';

/**
 * The plugin that carries the skills for this endpoint: `name` in
 * `claude-plugin/space/.claude-plugin/plugin.json`, and `plugin_name` in
 * `publish-space-plugin.yml`.
 *
 * One plugin per MCP endpoint, named after the API rather than any one toolset: two plugins
 * declaring the same MCP server would make a client connect to it twice and list every tool
 * twice. So this string stays generic as toolsets are added — it was `datalab` until 0.2.0.
 */
export const CN_MCP_PLUGIN_NAME = 'space';

/**
 * The `userConfig` key the plugin declares for this API's base URL, passed as
 * `--config <this>=<apiUrl>` at install time.
 *
 * The quiet failure of the four: the CLI rejects a key the manifest does not declare, and the
 * message names the flag rather than the plugin, so it reads as a bad command line rather than
 * as a value this API produced.
 */
export const CN_MCP_PLUGIN_API_URL_CONFIG_KEY = 'space_api_url';

/** Tool that answers "which Space would you use if I do not say". */
export const CN_MCP_TOOL_GET_DEFAULT_SPACE = 'constellab_get_default_space';

/** Tool that turns a Space name a user said out loud into an id a tool can take. */
export const CN_MCP_TOOL_LIST_SPACES = 'constellab_list_spaces';

/////////////////////////// LAB START-UP DIAGNOSIS TOOLS ///////////////////////////

/**
 * The tools that diagnose a lab that fails to start.
 *
 * The set is deliberately closed: the output of one supplies the input of the next, so there
 * is no tool whose arguments a model has to invent. That is why {@link CN_MCP_TOOL_LAB_LIST_CONTAINERS}
 * is not optional — it is what produces the container name
 * {@link CN_MCP_TOOL_LAB_CONTAINER_LOGS} requires.
 *
 * Named with the same `constellab_` prefix as every other tool on this server: an MCP client
 * shows one flat tool list gathered from every server it is connected to, so the prefix is
 * what keeps `lab_find` from colliding with another server's idea of a lab.
 */
export const CN_MCP_TOOL_LAB_FIND = 'constellab_lab_find';
export const CN_MCP_TOOL_LAB_DIAGNOSE_START = 'constellab_lab_diagnose_start';
export const CN_MCP_TOOL_LAB_GET_START_ERRORS = 'constellab_lab_get_start_errors';
export const CN_MCP_TOOL_LAB_LIST_CONTAINERS = 'constellab_lab_list_containers';
export const CN_MCP_TOOL_LAB_CONTAINER_LOGS = 'constellab_lab_container_logs';
export const CN_MCP_TOOL_LAB_STATUS_TIMELINE = 'constellab_lab_status_timeline';
export const CN_MCP_TOOL_LAB_REFRESH_STATUS = 'constellab_lab_refresh_status';

/**
 * What the lab tools say when the lab is not a cloud lab.
 *
 * Names the tools that still apply, because a refusal that only says "not supported" leaves a
 * model with no next step and it will retry the same call. A lab of another type has no cloud
 * instance, volume, static IP or ssh access of ours, so four of the six layers do not exist for
 * it — reporting them anyway would produce a confident, wrong verdict.
 *
 * The remaining tools differ by type, which is why this is not one sentence. An on-premise lab
 * runs a lab manager and its containers and logs are readable; a desktop lab is one the platform
 * refuses to manage at all, so the container and log tools are refused there too and saying
 * otherwise would send a model straight into a second refusal.
 */
export function cnMcpLabNotCloudMessage(labType: CnLabType): string {
  const alwaysApply = `${CN_MCP_TOOL_LAB_FIND} and ${CN_MCP_TOOL_LAB_STATUS_TIMELINE} work on every lab.`;

  if (labType === CnLabType.DESKTOP) {
    return (
      `This is a desktop lab, which runs on someone's own machine: it has no cloud server, ` +
      `volume, DNS record or ssh access of ours, and the platform declines to manage it at all — ` +
      `its containers and logs cannot be read from here either. Only ${alwaysApply}`
    );
  }

  return (
    `The six-layer start diagnosis only applies to a cloud lab, and this lab is ${labType}. ` +
    `On it, ${CN_MCP_TOOL_LAB_LIST_CONTAINERS}, ${CN_MCP_TOOL_LAB_CONTAINER_LOGS} and ` +
    `${CN_MCP_TOOL_LAB_GET_START_ERRORS} still work through its lab manager, and ${alwaysApply}`
  );
}

/**
 * What a lab tool says when it will not act on the lab for the account that asked.
 *
 * Every wording here ends with the same sentence: this is an authorization refusal and nothing
 * about the lab was read. Without it a model reads the refusal as a symptom and starts
 * diagnosing a lab that is perfectly healthy.
 *
 * Two situations, told apart by whether a role was found, because they have different fixes.
 * Holding the wrong role is answered by a promotion. Holding no role at all has two possible
 * causes that the platform deliberately cannot distinguish from one another — the account was
 * never added to the lab, or the lab is not in the Space the call named. Both are stated,
 * because a lab id resolves only inside the Space it was given with and is never quietly
 * resolved into its own: that is what keeps a lab id leaked from another Space from turning
 * itself into a read of that Space.
 */
export function cnMcpLabRoleRefusal(
  heldRole: string | null,
  requiredRole: string,
  toolName: string,
  labId: string,
  spaceId: string
): string {
  const closing =
    `This is an authorization refusal, not a fault of the lab: nothing about the lab's own ` +
    `state has been read, so do not report it as broken.`;

  if (heldRole == null) {
    return (
      `This account has no role on lab "${labId}" in the Space "${spaceId}", and ${toolName} ` +
      `requires ${requiredRole}. Either the account was never added to that lab, or the lab is ` +
      `not in that Space — a lab id is only valid inside the Space named on the call and is ` +
      `never resolved into another one. Check the Space with ${CN_MCP_TOOL_LAB_FIND}, which ` +
      `lists the labs this account can reach there. ${closing}`
    );
  }

  return (
    `This account holds the role ${heldRole} on lab "${labId}", and ${toolName} requires ` +
    `${requiredRole}. Ask a lab owner to run it, or to grant this account the ${requiredRole} ` +
    `role. ${closing}`
  );
}

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
