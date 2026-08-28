import { BlMcpInstallDTO, blMcpInstallInstructions, BlMcpPluginIdentity } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';

import { HnCoreConfigService } from '../core/modules/core-config/hn-core-config.service';
import {
  HN_MCP_COMMUNITY_DOC_RESOURCE_PATH,
  HN_MCP_PLUGIN_API_URL_CONFIG_KEY,
  HN_MCP_PLUGIN_MARKETPLACE_NAME,
  HN_MCP_PLUGIN_MARKETPLACE_REPO,
  HN_MCP_PLUGIN_NAME,
} from './hn-mcp-doc.constants';

/**
 * The command lines that install this application's Claude Code plugin.
 *
 * This application's whole contribution is its identity and its base URL. The commands
 * themselves are `blMcpInstallInstructions`, shared with the Space API: their syntax belongs
 * to the Claude Code CLI, so a flag that changes changes in one place.
 *
 * `API_URL` is read at request time rather than written per environment — the same value this
 * application's endpoints are advertised at. It is not `SPACE_API_URL`: per ADR-0001 the Space
 * API is the Authorization Server, so the URL a token comes from and the URL the plugin calls
 * are different hosts on purpose, and the one that belongs in the plugin's configuration is
 * this one, the Resource being called.
 */
@Injectable()
export class HnMcpDocInstallService {
  private static readonly PLUGIN: BlMcpPluginIdentity = {
    marketplaceRepo: HN_MCP_PLUGIN_MARKETPLACE_REPO,
    marketplaceName: HN_MCP_PLUGIN_MARKETPLACE_NAME,
    pluginName: HN_MCP_PLUGIN_NAME,
    apiUrlConfigKey: HN_MCP_PLUGIN_API_URL_CONFIG_KEY,
    resourcePath: HN_MCP_COMMUNITY_DOC_RESOURCE_PATH,
  };

  constructor(private configService: HnCoreConfigService) {}

  public getInstallInstructions(): BlMcpInstallDTO {
    return blMcpInstallInstructions(HnMcpDocInstallService.PLUGIN, this.configService.getApiUrl());
  }
}
