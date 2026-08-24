import { BlMcpInstallDTO, BlPublic } from '@monorepo/back-core-lib';
import { Controller, Get } from '@nestjs/common';

import { HnMcpDocInstallService } from './hn-mcp-doc-install.service';

/**
 * How a client learns to connect to this application's MCP endpoint.
 *
 * `GET mcp/install`, a sibling of the `POST mcp/community-doc` that `McpModule` mounts: the
 * instructions and the endpoint they lead to are served by the same module, so an endpoint that
 * moves takes its own install commands with it. The Space API answers the same path for its own
 * plugin, which is what lets a front-end ask either API the same question.
 *
 * `BlPublic()` because the payload is the plugin README's install section with this
 * deployment's own base URL substituted in — a caller already knows that URL, having just
 * called it. It also neutralizes the global JWT/admin guards, which would otherwise refuse an
 * anonymous reader on a documentation API most of whose content is public anyway.
 */
@Controller('mcp')
export class HnMcpDocInstallController {
  constructor(private installService: HnMcpDocInstallService) {}

  @BlPublic()
  @Get('install')
  public getInstallInstructions(): BlMcpInstallDTO {
    return this.installService.getInstallInstructions();
  }
}
