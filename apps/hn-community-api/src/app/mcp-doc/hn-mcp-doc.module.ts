import { BlPublic } from '@monorepo/back-core-lib';
import { Module } from '@nestjs/common';
import { McpModule, McpTransportType } from '@rekog/mcp-nest';

import { HnDocumentationModule } from '../brick-aggregate/documentation/hn-documentation.module';
import { HnMcpResourceGuard } from '../oauth/hn-mcp-resource.guard';
import { HnMcpDocService } from './hn-mcp-doc.service';
import { HnMcpDocTool } from './hn-mcp-doc.tool';

/**
 * MCP server exposing the community documentation (read-only) over Streamable HTTP.
 *
 * Endpoint: POST /mcp/community-doc
 *
 * Auth: `BlPublic()` neutralizes the global JWT/admin guards on this route, and the
 * generic {@link HnMcpResourceGuard} enforces an OAuth Bearer token whose `aud`
 * matches this resource — emitting the `WWW-Authenticate` header that triggers the
 * OAuth discovery flow in MCP clients.
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
      // Neutralize the global HnJwtAuthGuard/HnIsAdminGuard on this route...
      decorators: [BlPublic()],
      // ...and enforce the OAuth Resource Server check (Bearer token + audience).
      guards: [HnMcpResourceGuard],
      // Stateless keeps HTTP consumers (and the future gateway) simple: no session to track.
      streamableHttp: { statelessMode: true, enableJsonResponse: true },
    }),
  ],
  providers: [HnMcpDocService, HnMcpDocTool],
})
export class HnMcpDocModule {}
