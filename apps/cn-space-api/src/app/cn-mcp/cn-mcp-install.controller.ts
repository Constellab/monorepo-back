import { BlMcpInstallDTO, BlPublic } from '@monorepo/back-core-lib';
import { Controller, Get } from '@nestjs/common';

import { CnMcpInstallService } from './cn-mcp-install.service';

/**
 * How a client learns to connect to this application's MCP endpoint.
 *
 * `GET mcp/install`, a sibling of the `POST mcp/space-api` that `McpModule` mounts: the
 * instructions and the endpoint they lead to are served by the same module, so an endpoint
 * that moves takes its own install commands with it. The Community API answers the same path
 * for its own plugin.
 *
 * `BlPublic()` because the payload is the plugin README's install section with this
 * deployment's own base URL substituted in — a caller already knows that URL, having just
 * called it. Authenticating the route would gate nothing and would keep the front-end from
 * showing the commands on a page a user reaches before signing in.
 */
@Controller('mcp')
export class CnMcpInstallController {
  constructor(private installService: CnMcpInstallService) {}

  @BlPublic()
  @Get('install')
  public getInstallInstructions(): BlMcpInstallDTO {
    return this.installService.getInstallInstructions();
  }
}
