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
 * model with no next step and it will retry the same call. A desktop or on-premise lab has no
 * cloud instance, volume, static IP or ssh access of ours, so four of the six layers do not
 * exist for it — reporting them anyway would produce a confident, wrong verdict.
 */
export const CN_MCP_LAB_NOT_CLOUD_MESSAGE =
  `The six-layer start diagnosis only applies to a cloud lab. On a lab of another type, ` +
  `${CN_MCP_TOOL_LAB_LIST_CONTAINERS}, ${CN_MCP_TOOL_LAB_CONTAINER_LOGS} and ` +
  `${CN_MCP_TOOL_LAB_GET_START_ERRORS} still work if it runs a lab manager, and ` +
  `${CN_MCP_TOOL_LAB_STATUS_TIMELINE} works on every lab.`;

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
 * resolved into its own: that is what keeps a lab id leaked from another tenant from turning
 * itself into a read of that tenant.
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
