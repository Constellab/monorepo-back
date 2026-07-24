import { BlPublic } from '@monorepo/back-core-lib';
import { Module } from '@nestjs/common';
import { McpModule, McpTransportType } from '@rekog/mcp-nest';

import { HnDocumentationModule } from '../brick-aggregate/documentation/hn-documentation.module';
import { HnMcpDocService } from './hn-mcp-doc.service';
import { HnMcpDocTool } from './hn-mcp-doc.tool';

/**
 * MCP server exposing the community documentation (read-only) over Streamable HTTP.
 *
 * Endpoint: POST /mcp/community-doc
 *
 * The generated MCP controller is decorated with {@link BlPublic} so it bypasses the
 * global JWT/admin guards (auth is intentionally open for now — see the MCP federation
 * plan; a dedicated API-key guard will replace this before any non-public deployment).
 */
@Module({
  imports: [
    HnDocumentationModule,
    McpModule.forRoot({
      name: 'community-doc',
      version: '0.1.0',
      title: 'Constellab Community Documentation',
      instructions:
        'Tools to search and read the Constellab community documentation. ' +
        'Start with community_doc_search or community_doc_list, then community_doc_read for full content.',
      transport: McpTransportType.STREAMABLE_HTTP,
      mcpEndpoint: 'mcp/community-doc',
      // Make the MCP HTTP endpoint public (bypass the global HnJwtAuthGuard/HnIsAdminGuard).
      decorators: [BlPublic()],
      // Stateless keeps HTTP consumers (and the future gateway) simple: no session to track.
      streamableHttp: { statelessMode: true, enableJsonResponse: true },
    }),
  ],
  providers: [HnMcpDocService, HnMcpDocTool],
})
export class HnMcpDocModule {}
