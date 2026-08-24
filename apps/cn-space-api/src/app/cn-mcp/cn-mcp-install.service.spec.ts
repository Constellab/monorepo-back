import { CnCoreConfigService } from '../cn-core/modules/cn-core-config/cn-core-config.service';
import {
  CN_MCP_PLUGIN_API_URL_CONFIG_KEY,
  CN_MCP_PLUGIN_MARKETPLACE_NAME,
  CN_MCP_PLUGIN_NAME,
  CN_MCP_SPACE_API_RESOURCE_PATH,
} from './cn-mcp.constants';
import { CnMcpInstallService } from './cn-mcp-install.service';

/**
 * What is this application's own is the identity and the URL: that the commands name *this*
 * plugin and *this* deployment. How a command line is assembled is asserted once, on
 * `blMcpInstallInstructions` in back-core-lib, and that the identity matches the plugin
 * manifest is checked by `check_plugin_constants.sh` in CI, where jest does not run.
 */
describe('CnMcpInstallService', () => {
  function serviceWithApiUrl(apiUrl: string): CnMcpInstallService {
    const configService = { getApiUrl: () => apiUrl } as unknown as CnCoreConfigService;
    return new CnMcpInstallService(configService);
  }

  it('installs this plugin, configured with this API', () => {
    const result = serviceWithApiUrl('https://api.preconstellab.com').getInstallInstructions();

    expect(result.pluginName).toBe(CN_MCP_PLUGIN_NAME);
    expect(result.marketplace).toBe(CN_MCP_PLUGIN_MARKETPLACE_NAME);
    expect(result.steps[1].command).toBe(
      `claude plugin install ${CN_MCP_PLUGIN_NAME}@${CN_MCP_PLUGIN_MARKETPLACE_NAME} ` +
        `--config ${CN_MCP_PLUGIN_API_URL_CONFIG_KEY}=https://api.preconstellab.com`
    );
  });

  /**
   * `API_URL` is the OAuth issuer and the base of every endpoint advertised here, so reading it
   * is what ties the URL a user configures the plugin with to the URL its tokens are minted for.
   */
  it('points the plugin at the MCP endpoint this application mounts', () => {
    const result = serviceWithApiUrl('http://localhost:3001').getInstallInstructions();

    expect(result.apiUrl).toBe('http://localhost:3001');
    expect(result.mcpEndpointUrl).toBe(`http://localhost:3001/${CN_MCP_SPACE_API_RESOURCE_PATH}`);
  });
});
