import { BlPublic } from '@monorepo/back-core-lib';
import { Module } from '@nestjs/common';
import { McpModule, McpTransportType } from '@rekog/mcp-nest';

import { CnLabsModule } from '../cn-labs/cn-labs.module';
import { CnSpacesModule } from '../cn-spaces/cn-spaces.module';
import { CnUsersModule } from '../cn-users/cn-users.module';
import { CN_MCP_SPACE_API_RESOURCE_PATH } from './cn-mcp.constants';
import { CnMcpTool } from './cn-mcp.tool';
import { CnMcpAuthGuard } from './cn-mcp-auth.guard';
import { CnMcpInstallController } from './cn-mcp-install.controller';
import { CnMcpInstallService } from './cn-mcp-install.service';
import { CnMcpLabTool } from './cn-mcp-lab.tool';
import { CnMcpSession } from './cn-mcp-session.service';

/**
 * The Space API's MCP endpoint: the tool set an AI client reaches with an OAuth access token.
 *
 * Two groups of tools live behind it. {@link CnMcpTool} answers questions about Spaces and
 * labs, and {@link CnMcpLabTool} diagnoses a cloud lab that fails to start. All but one read;
 * the exception carries no `readOnlyHint` and says what it changes.
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
 *
 * {@link CnMcpInstallController} serves `GET mcp/install`, the command lines that install the
 * Claude Code plugin driving this endpoint. Here rather than in a settings module so an
 * endpoint that moves takes its own install instructions with it.
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
        'Access to Constellab. Data lives in Spaces, and this server remembers ' +
        'no current Space: every tool that reads inside one takes a required spaceId, so ' +
        'the Space is visible in the conversation on every call. Before using such a tool, ' +
        'establish which Space is meant — call constellab_get_default_space and tell the ' +
        'user which Space you will use, or, when they name one, call constellab_list_spaces ' +
        'to resolve that name to an id. Never guess or reuse an id the user has not been ' +
        'told about, and re-check when they ask to switch Space mid-conversation. ' +
        'When a data lab fails to start, call constellab_lab_diagnose_start before reading ' +
        'any log: it says which of the six layers of a lab start is blocked, and reading a ' +
        'deeper layer is wasted effort while an earlier one is down. Every tool here reads ' +
        'except constellab_lab_refresh_status, which writes a reconciled status and can ' +
        "start a lab's containers — say so to the user before calling it.",
      transport: McpTransportType.STREAMABLE_HTTP,
      mcpEndpoint: CN_MCP_SPACE_API_RESOURCE_PATH,
      decorators: [BlPublic()],
      guards: [CnMcpAuthGuard],
      streamableHttp: { statelessMode: true, enableJsonResponse: true },
    }),
  ],
  controllers: [CnMcpInstallController],
  providers: [CnMcpAuthGuard, CnMcpSession, CnMcpTool, CnMcpLabTool, CnMcpInstallService],
})
export class CnMcpModule {}
