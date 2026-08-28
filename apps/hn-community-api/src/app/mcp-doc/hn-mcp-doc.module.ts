import { BlPublic } from '@monorepo/back-core-lib';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { McpModule, McpTransportType } from '@rekog/mcp-nest';

import { HnBrickMajorVersion } from '../brick-aggregate/brick-major-version/hn-brick-major-version.entity';
import { HnDocumentationModule } from '../brick-aggregate/documentation/hn-documentation.module';
import { HnFolder } from '../brick-aggregate/folder/hn-folder.entity';
import { HnFolderModule } from '../brick-aggregate/folder/hn-folder.module';
import { HnBrickAggregateModule } from '../brick-aggregate/hn-brick-aggregate.module';
import { HnCoreConfigModule } from '../core/modules/core-config/hn-core-config.module';
import { HnRagflowChatbotModule } from '../ragflow-chatbot/hn-ragflow-chatbot.module';
import { HnUserModule } from '../users/hn-user.module';
import { HnMcpAuthGuard } from './hn-mcp-auth.guard';
import { HnMcpChatbotTool } from './hn-mcp-chatbot.tool';
import { HN_MCP_COMMUNITY_DOC_RESOURCE_PATH } from './hn-mcp-doc.constants';
import { HnMcpDocService } from './hn-mcp-doc.service';
import { HnMcpDocTool } from './hn-mcp-doc.tool';
import { HnMcpDocAuthorization } from './hn-mcp-doc-authorization.service';
import { HnMcpDocEditService } from './hn-mcp-doc-edit.service';
import { HnMcpDocEditTool } from './hn-mcp-doc-edit.tool';
import { HnMcpDocHistoryService } from './hn-mcp-doc-history.service';
import { HnMcpDocHistoryTool } from './hn-mcp-doc-history.tool';
import { HnMcpDocInstallController } from './hn-mcp-doc-install.controller';
import { HnMcpDocInstallService } from './hn-mcp-doc-install.service';
import { HnMcpDocStructureService } from './hn-mcp-doc-structure.service';
import { HnMcpDocStructureTool } from './hn-mcp-doc-structure.tool';

/**
 * MCP server exposing the community documentation over Streamable HTTP.
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
 * Toolsets: {@link HnMcpDocTool} browses and reads the documentation, {@link HnMcpDocEditTool}
 * writes to one page by operations, {@link HnMcpDocStructureTool} creates, renames, moves and
 * deletes pages and folders, {@link HnMcpDocHistoryTool} reads what happened to a page and puts it
 * back, and {@link HnMcpChatbotTool} puts a question to the RAG chatbot. All of them are registered
 * on this one server because a second MCP server would mean a second plugin declaring it, and a
 * client connecting to it twice.
 *
 * Everything but the read tools and the chatbot asks one thing of the caller beyond a Community
 * account: being the brick's author or a co-author. It is asked in one place,
 * {@link HnMcpDocAuthorization}, with the brick's own rule rather than one invented here — ten write
 * and history tools reach these pages now, and a rule copied ten times is a rule that will differ in
 * one of them.
 *
 * {@link HnMcpDocInstallController} serves `GET mcp/install`, the command lines that install
 * the Claude Code plugin driving this endpoint. Here rather than in a settings module so an
 * endpoint that moves takes its own install instructions with it.
 */
@Module({
  imports: [
    HnDocumentationModule,
    // The tree tool reads folders and brick versions directly, and so does the authorization: they
    // need the repositories, not the services around them, and importing their modules would drag
    // half the brick aggregate in.
    TypeOrmModule.forFeature([HnFolder, HnBrickMajorVersion]),
    // The folder service, for the two things the tree operations need of it that no repository
    // gives: a brick version's root folder, and a folder loaded with the children a move appends to.
    HnFolderModule,
    // For `HnBrickSecurity`, which decides who may edit a brick's documentation — the same object
    // the site's own doc controller asks, so the MCP cannot come to enforce a different rule on the
    // same page — and for `HnBrickAggregateService`, the entry point those controllers call to
    // create, rename, move and delete a node. Going through it is what keeps the path resolution,
    // the sibling ordering and the cascade down a moved folder single-sourced; rebuilding any of
    // them here would be the divergence itself.
    HnBrickAggregateModule,
    HnCoreConfigModule,
    HnRagflowChatbotModule,
    HnUserModule,
    McpModule.forRoot({
      name: 'community-doc',
      version: '0.1.0',
      title: 'Constellab Community Documentation',
      instructions:
        'Tools to read and to write the Constellab community documentation, which covers both the ' +
        'Constellab product (what the platform does and how to use it) and the technical documentation ' +
        'of its bricks — notably gws_core, i.e. how to develop in Constellab. Reading is open to any ' +
        'account; writing changes public pages, and is why the tools below take operations rather than ' +
        'whole documents. ' +
        'Ask community_doc_ask a conceptual question to get an answer from the documentation with its ' +
        'sources; use community_doc_search or community_doc_list to find pages by keyword or name, then ' +
        'community_doc_read for full content. ' +
        'To change the documentation rather than answer a question, start with community_doc_tree: ' +
        'it is the only tool that returns folder ids, and every create and every move needs one. ' +
        'For the content of one page, community_doc_read_blocks gives it as the blocks it is stored ' +
        'as — the markdown of community_doc_read loses the block ids an edit is expressed against — ' +
        'then community_doc_edit changes it by operations on those blocks, so the untouched ones keep ' +
        'their id and the page keeps its modification history. ' +
        'For the tree itself: community_doc_create (the page is created empty, its content then goes ' +
        'in with community_doc_edit), community_doc_rename, community_doc_move, community_doc_delete ' +
        '(final, and it takes confirm: true), community_folder_create, community_folder_rename and ' +
        'community_folder_move. No tool deletes a folder. ' +
        'When something goes wrong, community_doc_history lists what was recorded on a page and ' +
        'community_doc_rollback puts it back to any of those points; the rollback is itself recorded, ' +
        'so it can be rolled back in turn. It restores content only, never a deleted page. ' +
        "Everything except the searches, the reads and community_doc_ask requires being the brick's " +
        'author or a co-author.',
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
  providers: [
    HnMcpAuthGuard,
    HnMcpDocAuthorization,
    HnMcpDocService,
    HnMcpDocTool,
    HnMcpDocEditService,
    HnMcpDocEditTool,
    HnMcpDocStructureService,
    HnMcpDocStructureTool,
    HnMcpDocHistoryService,
    HnMcpDocHistoryTool,
    HnMcpChatbotTool,
    HnMcpDocInstallService,
  ],
})
export class HnMcpDocModule {}
