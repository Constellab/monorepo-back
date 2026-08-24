import { BlPublic } from '@monorepo/back-core-lib';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { McpModule, McpTransportType } from '@rekog/mcp-nest';

import { HnBrickMajorVersion } from '../brick-aggregate/brick-major-version/hn-brick-major-version.entity';
import { HnDocumentationModule } from '../brick-aggregate/documentation/hn-documentation.module';
import { HnFolder } from '../brick-aggregate/folder/hn-folder.entity';
import { HnCoreConfigModule } from '../core/modules/core-config/hn-core-config.module';
import { HnRagflowChatbotModule } from '../ragflow-chatbot/hn-ragflow-chatbot.module';
import { HnUserModule } from '../users/hn-user.module';
import { HnMcpAuthGuard } from './hn-mcp-auth.guard';
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
 * Auth: `BlPublic()` neutralizes the global JWT/admin guards on this route, and
 * {@link HnMcpAuthGuard} takes over — the generic Bearer/audience check and its
 * `WWW-Authenticate` challenge, then this application's own user record, put in the request's
 * auth context once for the whole request. Every tool here therefore knows who is calling,
 * reads included: see ADR-0004 for why that narrowing was accepted, and why a valid token
 * with no Community account is refused rather than given one.
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
    // The tree tool reads folders and brick versions directly: it needs two repositories, not the
    // services around them, and importing their modules would drag half the brick aggregate in.
    TypeOrmModule.forFeature([HnFolder, HnBrickMajorVersion]),
    HnCoreConfigModule,
    HnRagflowChatbotModule,
    HnUserModule,
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
        'community_doc_read for full content. ' +
        'To prepare an edit rather than answer a question, use community_doc_tree for the folder and page ' +
        'ids of a brick and community_doc_read_blocks for a page as the blocks it is stored as: the ' +
        'markdown of community_doc_read loses the block ids an edit is expressed against.',
      transport: McpTransportType.STREAMABLE_HTTP,
      mcpEndpoint: HN_MCP_COMMUNITY_DOC_RESOURCE_PATH,
      // Neutralize the global HnJwtAuthGuard/HnIsAdminGuard on this route...
      decorators: [BlPublic()],
      // ...and enforce the OAuth Resource Server check (Bearer token + audience), then the
      // Community user behind the token's subject.
      guards: [HnMcpAuthGuard],
      // Stateless keeps HTTP consumers (and the future gateway) simple: no session to track.
      streamableHttp: { statelessMode: true, enableJsonResponse: true },
    }),
  ],
  controllers: [HnMcpDocInstallController],
  providers: [HnMcpAuthGuard, HnMcpDocService, HnMcpDocTool, HnMcpChatbotTool, HnMcpDocInstallService],
})
export class HnMcpDocModule {}
