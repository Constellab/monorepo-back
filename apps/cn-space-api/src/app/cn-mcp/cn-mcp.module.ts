import { BlPublic } from '@monorepo/back-core-lib';
import { Module } from '@nestjs/common';
import { McpModule, McpTransportType } from '@rekog/mcp-nest';

import { CnLabsModule } from '../cn-labs/cn-labs.module';
import { CnSpacesModule } from '../cn-spaces/cn-spaces.module';
import { CnUsersModule } from '../cn-users/cn-users.module';
import { CN_MCP_SPACE_API_RESOURCE_PATH } from './cn-mcp.constants';
import { CnMcpTool } from './cn-mcp.tool';
import { CnMcpAuthGuard } from './cn-mcp-auth.guard';
import { CnMcpSession } from './cn-mcp-session.service';

/**
 * The Space API's MCP endpoint: a small read-only tool set an AI client reaches with an
 * OAuth access token.
 *
 * Endpoint: POST /{@link CN_MCP_SPACE_API_RESOURCE_PATH} — the same constant the
 * application module registers as a Resource, so the endpoint and its token audience
 * cannot drift apart. One Resource, one audience, whichever Space a call names: per
 * ADR-0003 the Space is a tool parameter and never part of the Resource's identity.
 *
 * Auth: `BlPublic()` neutralizes the global `CnJwtAuthGuard`, which authenticates browsers
 * by cookie and would refuse a machine call before it started, and {@link CnMcpAuthGuard}
 * takes over — Bearer token, audience, `WWW-Authenticate` challenge, then this
 * application's own user record.
 *
 * Stateless, deliberately: no session to track, and — the point of ADR-0003 — no
 * remembered current Space that could drift from the one the user believes is selected.
 */
@Module({
  imports: [
    CnUsersModule,
    CnSpacesModule,
    CnLabsModule,
    McpModule.forRoot({
      name: 'constellab-space-api',
      version: '0.1.0',
      title: 'Constellab',
      instructions:
        'Read-only access to Constellab. Data lives in Spaces, and this server remembers ' +
        'no current Space: every tool that reads inside one takes a required spaceId, so ' +
        'the Space is visible in the conversation on every call. Before using such a tool, ' +
        'establish which Space is meant — call constellab_get_default_space and tell the ' +
        'user which Space you will use, or, when they name one, call constellab_list_spaces ' +
        'to resolve that name to an id. Never guess or reuse an id the user has not been ' +
        'told about, and re-check when they ask to switch Space mid-conversation.',
      transport: McpTransportType.STREAMABLE_HTTP,
      mcpEndpoint: CN_MCP_SPACE_API_RESOURCE_PATH,
      decorators: [BlPublic()],
      guards: [CnMcpAuthGuard],
      streamableHttp: { statelessMode: true, enableJsonResponse: true },
    }),
  ],
  providers: [CnMcpAuthGuard, CnMcpSession, CnMcpTool],
})
export class CnMcpModule {}
