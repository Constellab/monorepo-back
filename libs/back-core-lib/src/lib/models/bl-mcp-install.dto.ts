/**
 * One step of installing an application's Claude Code plugin.
 *
 * A list of steps rather than one block of text: a single string would force the caller to
 * split on newlines to render a copy button per command, and would leave nowhere to put a step
 * that is not a command at all.
 */
export interface BlMcpInstallStepDTO {
  /**
   * The command to run, or null for a step the user performs somewhere else.
   *
   * Null is not an error case: it is how "now sign in from inside the client" travels in the
   * same ordered list as the shell commands, instead of as prose each front-end carries
   * separately and keeps in step with the route.
   */
  command: string | null;

  /** One line on what the step does, for the caller to render beside the command. */
  description: string;
}

/**
 * What a client is told to type to install the plugin driving an application's MCP endpoint.
 *
 * The identifiers are returned alongside the commands they appear in, which is what makes a
 * support answer possible: given a payload one can see which marketplace and which API URL a
 * user was handed, without guessing which environment they read it from.
 */
export interface BlMcpInstallDTO {
  /** The plugin's name in the marketplace, the `space` of `space@constellab`. */
  pluginName: string;

  /** The marketplace it is installed from, the `constellab` of `space@constellab`. */
  marketplace: string;

  /** Base URL of the API serving this payload. Never a trailing slash. */
  apiUrl: string;

  /** Full URL of the MCP endpoint the plugin will connect to, for display and support. */
  mcpEndpointUrl: string;

  /** The steps to follow, in order. */
  steps: BlMcpInstallStepDTO[];
}
