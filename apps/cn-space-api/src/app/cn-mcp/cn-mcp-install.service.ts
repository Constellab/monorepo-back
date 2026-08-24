import { BlMcpInstallDTO, blMcpInstallInstructions, BlMcpPluginIdentity } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';

import { CnCoreConfigService } from '../cn-core/modules/cn-core-config/cn-core-config.service';
import {
  CN_MCP_PLUGIN_API_URL_CONFIG_KEY,
  CN_MCP_PLUGIN_MARKETPLACE_NAME,
  CN_MCP_PLUGIN_MARKETPLACE_REPO,
  CN_MCP_PLUGIN_NAME,
  CN_MCP_SPACE_API_RESOURCE_PATH,
} from './cn-mcp.constants';

/**
 * The command lines that install this application's Claude Code plugin.
 *
 * This application's whole contribution is its identity and its base URL. The commands
 * themselves are `blMcpInstallInstructions`, shared with the Community API: their syntax
 * belongs to the Claude Code CLI, so a flag that changes changes in one place.
 *
 * `API_URL` is read at request time rather than written per environment. It is already the
 * OAuth issuer and the base of every endpoint advertised here, which is what ties the URL a
 * user configures the plugin with to the URL its access tokens are minted for.
 */
@Injectable()
export class CnMcpInstallService {
  private static readonly PLUGIN: BlMcpPluginIdentity = {
    marketplaceRepo: CN_MCP_PLUGIN_MARKETPLACE_REPO,
    marketplaceName: CN_MCP_PLUGIN_MARKETPLACE_NAME,
    pluginName: CN_MCP_PLUGIN_NAME,
    apiUrlConfigKey: CN_MCP_PLUGIN_API_URL_CONFIG_KEY,
    resourcePath: CN_MCP_SPACE_API_RESOURCE_PATH,
  };

  constructor(private configService: CnCoreConfigService) {}

  public getInstallInstructions(): BlMcpInstallDTO {
    return blMcpInstallInstructions(CnMcpInstallService.PLUGIN, this.configService.getApiUrl());
  }
}
