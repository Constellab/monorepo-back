import { BlPublic, BlResourceGuard } from '@monorepo/back-core-lib';
import { Module } from '@nestjs/common';
import { McpModule, McpTransportType } from '@rekog/mcp-nest';

import { HnDocumentationModule } from '../brick-aggregate/documentation/hn-documentation.module';
import { HnCoreConfigModule } from '../core/modules/core-config/hn-core-config.module';
import { HnRagflowChatbotModule } from '../ragflow-chatbot/hn-ragflow-chatbot.module';
import { HnMcpChatbotTool } from './hn-mcp-chatbot.tool';
import { HN_MCP_COMMUNITY_DOC_RESOURCE_PATH } from './hn-mcp-doc.constants';
import { HnMcpDocService } from './hn-mcp-doc.service';
import { HnMcpDocTool } from './hn-mcp-doc.tool';
import { HnMcpDocInstallController } from './hn-mcp-doc-install.controller';
import { HnMcpDocInstallService } from './hn-mcp-doc-install.service';

/**
 * MCP server exposing the community documentation (read-only) over Streamable HTTP.
 *
 * Endpoint: POST /{@link HN_MCP_COMMUNITY_DOC_RESOURCE_PATH} — the same constant the
 * application module registers as a Resource, so the endpoint and its token audience
 * cannot drift apart.
 *
 * Auth: `BlPublic()` neutralizes the global JWT/admin guards on this route, and the
 * generic {@link BlResourceGuard} enforces an OAuth Bearer token whose `aud` matches
 * this Resource — emitting the `WWW-Authenticate` header that triggers the OAuth
 * discovery flow in MCP clients.
 *
 * Toolsets: {@link HnMcpDocTool} browses and reads the documentation, {@link HnMcpChatbotTool} puts a
 * question to the RAG chatbot. Both are registered on this one server because a second MCP server
 * would mean a second plugin declaring it, and a client connecting to it twice.
 *
 * {@link HnMcpDocInstallController} serves `GET mcp/install`, the command lines that install
 * the Claude Code plugin driving this endpoint. Here rather than in a settings module so an
 * endpoint that moves takes its own install instructions with it.
 */
@Module({
  imports: [
    HnDocumentationModule,
    HnCoreConfigModule,
    HnRagflowChatbotModule,
    McpModule.forRoot({
      name: 'community-doc',
      version: '0.1.0',
      title: 'Constellab Community Documentation',
      instructions:
        'Tools to search and read the Constellab community documentation, which covers both the ' +
        'Constellab product (what the platform does and how to use it) and the technical documentation ' +
        'of its bricks — notably gws_core, i.e. how to develop in Constellab. ' +
        'Ask community_doc_ask a conceptual question to get an answer from the documentation with its ' +
        'sources; use community_doc_search or community_doc_list to find pages by keyword or name, then ' +
        'community_doc_read for full content.',
      transport: McpTransportType.STREAMABLE_HTTP,
      mcpEndpoint: HN_MCP_COMMUNITY_DOC_RESOURCE_PATH,
      // Neutralize the global HnJwtAuthGuard/HnIsAdminGuard on this route...
      decorators: [BlPublic()],
      // ...and enforce the OAuth Resource Server check (Bearer token + audience).
      guards: [BlResourceGuard],
      // Stateless keeps HTTP consumers (and the future gateway) simple: no session to track.
      streamableHttp: { statelessMode: true, enableJsonResponse: true },
    }),
  ],
  controllers: [HnMcpDocInstallController],
  providers: [HnMcpDocService, HnMcpDocTool, HnMcpChatbotTool, HnMcpDocInstallService],
})
export class HnMcpDocModule {}
