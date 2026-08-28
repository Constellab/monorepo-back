import { HnCoreConfigService } from '../core/modules/core-config/hn-core-config.service';
import {
  HN_MCP_COMMUNITY_DOC_RESOURCE_PATH,
  HN_MCP_PLUGIN_API_URL_CONFIG_KEY,
  HN_MCP_PLUGIN_MARKETPLACE_NAME,
  HN_MCP_PLUGIN_NAME,
} from './hn-mcp-doc.constants';
import { HnMcpDocInstallService } from './hn-mcp-doc-install.service';

/**
 * What is this application's own is the identity and the URL: that the commands name *this*
 * plugin and *this* deployment. How a command line is assembled is asserted once, on
 * `blMcpInstallInstructions` in back-core-lib, and that the identity matches the plugin
 * manifest is checked by `check_plugin_constants.sh` in CI, where jest does not run.
 */
describe('HnMcpDocInstallService', () => {
  function serviceWithApiUrl(apiUrl: string): HnMcpDocInstallService {
    const configService = { getApiUrl: () => apiUrl } as unknown as HnCoreConfigService;
    return new HnMcpDocInstallService(configService);
  }

  it('installs this plugin, configured with this API', () => {
    const result = serviceWithApiUrl('https://api.constellab.community').getInstallInstructions();

    expect(result.pluginName).toBe(HN_MCP_PLUGIN_NAME);
    expect(result.marketplace).toBe(HN_MCP_PLUGIN_MARKETPLACE_NAME);
    expect(result.steps[1].command).toBe(
      `claude plugin install ${HN_MCP_PLUGIN_NAME}@${HN_MCP_PLUGIN_MARKETPLACE_NAME} ` +
        `--config ${HN_MCP_PLUGIN_API_URL_CONFIG_KEY}=https://api.constellab.community`
    );
  });

  /**
   * `API_URL`, not `SPACE_API_URL`. Per ADR-0001 the Space API is the Authorization Server, so
   * the host a token comes from and the host the plugin calls differ on purpose — and what
   * belongs in the plugin's configuration is this one, the Resource being called.
   */
  it('points the plugin at the MCP endpoint this application mounts', () => {
    const result = serviceWithApiUrl('http://localhost:3333').getInstallInstructions();

    expect(result.apiUrl).toBe('http://localhost:3333');
    expect(result.mcpEndpointUrl).toBe(`http://localhost:3333/${HN_MCP_COMMUNITY_DOC_RESOURCE_PATH}`);
  });
});
