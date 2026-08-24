import { blMcpInstallInstructions, BlMcpPluginIdentity } from './bl-mcp-install.helper';

/**
 * These commands are copied into a terminal by hand, so a wrong one is not a failed request —
 * it is a user with a broken install and an error naming a CLI flag rather than the API that
 * produced it.
 *
 * The mechanics are asserted once, here. Each application's own spec asserts only that its
 * identity reaches this function; that the identity matches the plugin manifest is checked by
 * `check_plugin_constants.sh` in CI, because jest does not run there.
 */
describe('blMcpInstallInstructions', () => {
  const PLUGIN: BlMcpPluginIdentity = {
    marketplaceRepo: 'Constellab/agent-plugins',
    marketplaceName: 'constellab',
    pluginName: 'space',
    apiUrlConfigKey: 'space_api_url',
    resourcePath: 'mcp/space-api',
  };

  it('builds both commands from the identity and the base URL', () => {
    const result = blMcpInstallInstructions(PLUGIN, 'https://api.preconstellab.com');

    expect(result.steps[0].command).toBe('claude plugin marketplace add Constellab/agent-plugins');
    expect(result.steps[1].command).toBe(
      'claude plugin install space@constellab --config space_api_url=https://api.preconstellab.com'
    );
  });

  /**
   * The base URL is passed in, never written per environment: preprod, prod and a developer's
   * machine differ by that one value, and it is the same one an application advertises its OAuth
   * issuer and MCP endpoint at. A literal would be a second source of truth able to disagree
   * with the audience a token is minted for.
   */
  it('follows the base URL it is given', () => {
    const local = blMcpInstallInstructions(PLUGIN, 'http://localhost:3001');

    expect(local.apiUrl).toBe('http://localhost:3001');
    expect(local.steps[1].command).toContain('space_api_url=http://localhost:3001');
    expect(local.mcpEndpointUrl).toBe('http://localhost:3001/mcp/space-api');
  });

  /**
   * A plugin manifest joins the configured base URL to the endpoint path with a `/`, so a
   * trailing slash would reach the client as `//mcp/space-api`. Nothing validates `API_URL` on
   * the way in, so it is trimmed here rather than trusted.
   */
  it('strips trailing slashes from the base URL', () => {
    const result = blMcpInstallInstructions(PLUGIN, 'https://api.constellab.space//');

    expect(result.apiUrl).toBe('https://api.constellab.space');
    expect(result.mcpEndpointUrl).toBe('https://api.constellab.space/mcp/space-api');
    expect(result.steps[1].command).not.toContain('space//');
  });

  /** Each application's own identity produces its own commands, from the one function. */
  it('names whichever plugin it is given', () => {
    const community = blMcpInstallInstructions(
      {
        marketplaceRepo: 'Constellab/agent-plugins',
        marketplaceName: 'constellab',
        pluginName: 'community',
        apiUrlConfigKey: 'community_api_url',
        resourcePath: 'mcp/community-doc',
      },
      'https://api.constellab.community'
    );

    expect(community.steps[1].command).toBe(
      'claude plugin install community@constellab --config community_api_url=https://api.constellab.community'
    );
    expect(community.mcpEndpointUrl).toBe('https://api.constellab.community/mcp/community-doc');
  });

  /**
   * Installing registers the MCP server without authorizing it, and an unauthorized server
   * lists no tools rather than reporting anything — so the sign-in step travels in the same
   * ordered list as the commands, with no command of its own.
   */
  it('ends on the sign-in step, which is not a command', () => {
    const result = blMcpInstallInstructions(PLUGIN, 'https://api.constellab.space');
    const lastStep = result.steps[result.steps.length - 1];

    expect(lastStep.command).toBeNull();
    expect(lastStep.description).toContain('/mcp');
    expect(result.steps.filter((step) => step.command != null)).toHaveLength(2);
  });
});
