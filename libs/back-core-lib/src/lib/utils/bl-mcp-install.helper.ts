import { BlMcpInstallDTO } from '../models/bl-mcp-install.dto';

/**
 * What an application has to say about itself to describe its own plugin.
 *
 * Every field is a string that exists twice — here and in the plugin's `plugin.json` or the
 * marketplace it is published to — because nothing can import across that boundary. Each
 * application declares its own set as constants beside its MCP endpoint path, and a CI check
 * compares the two that come from the manifest.
 */
export interface BlMcpPluginIdentity {
  /** Repository the marketplace is added from: `claude plugin marketplace add <this>`. */
  marketplaceRepo: string;

  /** `name` in that repository's `marketplace.json` — the `constellab` of `space@constellab`. */
  marketplaceName: string;

  /** `name` in the plugin's own `plugin.json` — the `space` of `space@constellab`. */
  pluginName: string;

  /** The `userConfig` key the plugin declares for this API's base URL. */
  apiUrlConfigKey: string;

  /** Path this application mounts its MCP endpoint at, relative to its base URL. */
  resourcePath: string;
}

/**
 * The command lines that install an application's Claude Code plugin.
 *
 * Here rather than in each application because the commands are the CLI's syntax, not
 * Constellab's: `claude plugin install <name>@<marketplace> --config <key>=<value>` is a
 * contract with Claude Code, and a flag that changes should change in one place. What each
 * application supplies is its own identity and its own base URL.
 *
 * `apiUrl` is expected to be the value the application advertises everything else at — its
 * OAuth issuer and the base of its endpoints — so that the URL a user configures the plugin
 * with is by construction the URL its access tokens are minted for. A literal per environment
 * could disagree with that, and the failure would arrive as an audience mismatch on the first
 * tool call, long after the command was copied.
 *
 * Trailing slashes are trimmed: a plugin manifest joins the configured base URL to the endpoint
 * path with a `/`, so a stray one reaches the client as `//mcp/...`. Trimmed here rather than
 * asked of whoever sets the environment variable, since nothing validates that on the way in.
 */
export function blMcpInstallInstructions(plugin: BlMcpPluginIdentity, apiUrl: string): BlMcpInstallDTO {
  const baseUrl: string = apiUrl.replace(/\/+$/, '');
  const pluginRef = `${plugin.pluginName}@${plugin.marketplaceName}`;

  return {
    pluginName: plugin.pluginName,
    marketplace: plugin.marketplaceName,
    apiUrl: baseUrl,
    mcpEndpointUrl: `${baseUrl}/${plugin.resourcePath}`,
    steps: [
      {
        command: `claude plugin marketplace add ${plugin.marketplaceRepo}`,
        description:
          'Register the Constellab marketplace. Once per machine — later plugins are installed ' +
          'from the same one.',
      },
      {
        command: `claude plugin install ${pluginRef} --config ${plugin.apiUrlConfigKey}=${baseUrl}`,
        description: 'Install the plugin and point it at this API.',
      },
      {
        // Not a command, and the step users get stuck on: installing the plugin registers the
        // MCP server without authorizing it, and an unauthorized server lists no tools rather
        // than reporting anything.
        command: null,
        description:
          'In Claude Code, run /mcp and sign in to Constellab. The plugin is installed but ' +
          'authorized separately, and until it is, its tools do not appear.',
      },
    ],
  };
}
