import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';

// `import type`: these appear in @Tool-decorated signatures, and `emitDecoratorMetadata`
// would otherwise emit a runtime reference to a type-only import.
import type { CnRequest } from '../cn-core/utils/cn-current-user.helper';
import { CnLab } from '../cn-labs/cn-lab.entity';
import { CnLabAggregateService } from '../cn-labs/cn-lab-aggregate.service';
import { CnSpace } from '../cn-spaces/cn-space.entity';
import { CnSpaceAggregateService } from '../cn-spaces/cn-space-aggregate.service';
import {
  CN_MCP_SPACE_REQUIRED_MESSAGE,
  CN_MCP_TOOL_GET_DEFAULT_SPACE,
  CN_MCP_TOOL_LIST_SPACES,
} from './cn-mcp.constants';
import { CnMcpSession } from './cn-mcp-session.service';

/** The shape @rekog/mcp-nest expects a tool handler to return. */
type CnMcpToolResponse = {
  content: {
    type: 'text';
    text: string;
  }[];
  isError?: boolean;
};

/**
 * The Space parameter every Space-scoped tool takes.
 *
 * Required rather than defaulted, per ADR-0003: a silent default would let a model operate
 * on a Space the user never confirmed, with nothing in the conversation revealing which
 * one. The validation message is the same sentence the runtime refusal uses, so a client
 * that omits the argument and a client that sends a blank one both learn which tool to
 * call next.
 */
const spaceIdParameter = z
  .string({ error: CN_MCP_SPACE_REQUIRED_MESSAGE })
  .min(1, { error: CN_MCP_SPACE_REQUIRED_MESSAGE })
  .describe(
    `Id of the Space to act in. Required — this server has no current Space. Obtain it from ` +
      `${CN_MCP_TOOL_GET_DEFAULT_SPACE} or ${CN_MCP_TOOL_LIST_SPACES}; never invent one.`
  );

/**
 * The read-only tool set the Space API exposes over MCP.
 *
 * Deliberately small. It exists so the whole machine authentication path — discovery,
 * approval, an asymmetrically signed token, silent renewal — is exercised by a real client
 * rather than only by tests, and so the Space-per-call model of ADR-0003 can be tried in a
 * conversation. It is not the tool surface the platform will end up with.
 *
 * Two tools answer questions about Spaces themselves and take no Space; the rest reach
 * Space-owned data and go through {@link CnMcpSession.inSpace}, which is where membership
 * and role are checked. Payloads are built field by field rather than serialized from the
 * application's DTOs: those carry eagerly loaded `createdBy` user rows and lab credentials,
 * which `JSON.stringify` would include even where `@Exclude` keeps them out of an HTTP
 * response.
 *
 * Every handler takes the HTTP request the MCP library passes as its third argument and
 * hands it straight to the session — it is what carries the caller the guard authenticated,
 * and what each call's own context is built from.
 */
@Injectable()
export class CnMcpTool {
  constructor(
    private readonly session: CnMcpSession,
    private readonly spaceAggregateService: CnSpaceAggregateService,
    private readonly labAggregateService: CnLabAggregateService
  ) {}

  @Tool({
    name: CN_MCP_TOOL_GET_DEFAULT_SPACE,
    description:
      'Return the Space this account works in by default: the one it last connected to, ' +
      'or its personal Space when there is none. This is the Space the Constellab web ' +
      'application opens after login. Call it when the user has not named a Space, then ' +
      'tell them which Space you are going to use before acting in it.',
    parameters: z.object({}),
    annotations: { readOnlyHint: true },
  })
  async getDefaultSpace(_args: unknown, _context: unknown, request: CnRequest): Promise<CnMcpToolResponse> {
    return this.session.asCaller(request, async () => {
      const space = await this.spaceAggregateService.findCurrentUserDefaultSpace();
      return this.asJson({ defaultSpace: this.toSpace(space) });
    });
  }

  @Tool({
    name: CN_MCP_TOOL_LIST_SPACES,
    description:
      'List the Spaces this account belongs to, with their ids and names. Use it to turn a ' +
      'Space the user named in conversation into the id that every Space-scoped tool ' +
      'requires. Only Spaces the account is a member of are returned.',
    parameters: z.object({}),
    annotations: { readOnlyHint: true },
  })
  async listSpaces(_args: unknown, _context: unknown, request: CnRequest): Promise<CnMcpToolResponse> {
    return this.session.asCaller(request, async () => {
      const spaces = await this.spaceAggregateService.findCurrentUserSpaces();
      return this.asJson({ count: spaces.length, spaces: spaces.map((space) => this.toSpace(space)) });
    });
  }

  @Tool({
    name: 'constellab_list_labs',
    description:
      'List the labs this account can reach in one Space, most recently changed first. ' +
      'Returns each lab id, name, type and current status. Use constellab_get_lab for one ' +
      "lab's details.",
    parameters: z.object({
      spaceId: spaceIdParameter,
      page: z.number().int().min(0).default(0).describe('Zero-based page number.'),
      size: z.number().int().min(1).max(100).default(20).describe('Labs per page.'),
    }),
    annotations: { readOnlyHint: true },
  })
  async listLabs(
    { spaceId, page, size }: { spaceId: string; page: number; size: number },
    _context: unknown,
    request: CnRequest
  ): Promise<CnMcpToolResponse> {
    return this.session.inSpace(request, spaceId, async (userInfo) => {
      const labs = await this.labAggregateService.getCurrentLabs(page, size);
      return this.asJson({
        space: this.toSpace(userInfo.space),
        page: labs.currentPage,
        totalElements: labs.totalElements,
        labs: labs.objects.map((lab) => this.toLab(lab)),
      });
    });
  }

  @Tool({
    name: 'constellab_get_lab',
    description:
      'Read one lab in one Space, including the role this account holds on it. Fails if ' +
      'the lab belongs to another Space, or if the account has no access to it.',
    parameters: z.object({
      spaceId: spaceIdParameter,
      labId: z.string().min(1).describe('Id of the lab, as returned by constellab_list_labs.'),
    }),
    annotations: { readOnlyHint: true },
  })
  async getLab(
    { spaceId, labId }: { spaceId: string; labId: string },
    _context: unknown,
    request: CnRequest
  ): Promise<CnMcpToolResponse> {
    return this.session.inSpace(request, spaceId, async (userInfo) => {
      // Goes through the same aggregate the browser calls, so the Space of the lab and the
      // account's role on it are checked by the code that already owns those rules.
      const found = await this.labAggregateService.findByIdAndCheck(labId);
      return this.asJson({
        space: this.toSpace(userInfo.space),
        lab: {
          id: found.lab.id,
          name: found.lab.name,
          type: found.lab.type,
          status: found.lab.currentStatus?.status ?? null,
          frontUrl: found.lab.frontUrl,
          isFreeLab: found.lab.isFreeLab,
        },
        yourRoleOnThisLab: found.userRole,
        yourRoleInThisSpace: userInfo.roleInSpace,
      });
    });
  }

  private toSpace(space: CnSpace): { id: string; name: string; type: string } {
    return { id: space.id, name: space.name, type: space.type };
  }

  private toLab(lab: CnLab): Record<string, unknown> {
    return {
      id: lab.id,
      name: lab.name,
      type: lab.type,
      status: lab.currentStatus?.status ?? null,
      frontUrl: lab.frontUrl,
      isFreeLab: lab.isFreeLab,
      lastModifiedAt: lab.lastModifiedAt?.toISO() ?? null,
    };
  }

  private asJson(payload: unknown): CnMcpToolResponse {
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(payload, null, 2) }],
    };
  }
}
