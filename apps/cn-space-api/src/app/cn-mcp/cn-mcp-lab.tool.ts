import { BlSearchParams, BlUnauthorizedException } from '@monorepo/back-core-lib';
import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';

// `import type`: these appear in @Tool-decorated signatures, and `emitDecoratorMetadata`
// would otherwise emit a runtime reference to a type-only import.
import type { CnRequest } from '../cn-core/utils/cn-current-user.helper';
import { CnLabType } from '../cn-labs/cn-lab.entity';
import { CnLabAggregateService } from '../cn-labs/cn-lab-aggregate.service';
import { CnLabNotCloudException } from '../cn-labs/diagnosis/cn-lab-not-cloud.exception';
import { CnLabStatus } from '../cn-labs/status/cn-lab-status.enum';
import { CnLabUserRole } from '../cn-labs/user/cn-lab-user.entity';
import { CnUserSpaceInfo } from '../cn-users/cn-user.dto';
import {
  CN_MCP_LAB_NOT_CLOUD_MESSAGE,
  CN_MCP_TOOL_LAB_CONTAINER_LOGS,
  CN_MCP_TOOL_LAB_DIAGNOSE_START,
  CN_MCP_TOOL_LAB_FIND,
  CN_MCP_TOOL_LAB_GET_START_ERRORS,
  CN_MCP_TOOL_LAB_LIST_CONTAINERS,
  CN_MCP_TOOL_LAB_REFRESH_STATUS,
  CN_MCP_TOOL_LAB_STATUS_TIMELINE,
  cnMcpLabRoleRefusal,
} from './cn-mcp.constants';
import {
  cnMcpContainerLogsPayload,
  cnMcpContainersPayload,
  cnMcpDiagnosisPayload,
  cnMcpLabRow,
  cnMcpStartErrorsPayload,
  cnMcpTimelinePayload,
} from './cn-mcp-lab.dto';
import { CnMcpSession } from './cn-mcp-session.service';
import { CN_MCP_SPACE_ID_PARAMETER, cnMcpJson, CnMcpToolResponse } from './cn-mcp-tool.helper';

/** Id of the lab, described once because all six lab-scoped tools take the same one. */
const labIdParameter = z
  .string()
  .min(1)
  .describe(`Id of the lab, as returned by ${CN_MCP_TOOL_LAB_FIND}. Never construct one.`);

/**
 * The tools that diagnose a cloud lab which fails to start.
 *
 * Starting a cloud lab crosses six systems — the Space database, the cloud provider, DNS, the
 * server over ssh, the lab manager and the lab itself — and each can fail on its own. Knowing
 * which one is stuck today means calling around ten endpoints in the right order, and that
 * ordering lives only in the heads of the people who wrote the start sequence. Encoding it is
 * most of the value here: `blockedAtLayer` is what stops a model reading container logs on a
 * server whose volume was never attached.
 *
 * The set is closed on purpose. Every tool's output supplies the next one's input, so there is
 * no argument a model has to invent: {@link listContainers} is what produces the container name
 * {@link containerLogs} requires, and {@link find} is what produces every lab id.
 *
 * ## Authorization
 *
 * Nothing here checks a role itself. Every call goes through {@link CnMcpSession.inSpace},
 * which resolves and authorizes the Space, and then through {@link CnLabAggregateService},
 * where the lab-level role check already lives — the same check the browser makes, so
 * "enforced exactly as in the browser" is true by construction and not by two implementations
 * agreeing. The roles are heterogeneous because the browser's are: five operations require the
 * lab OWNER and two accept any lab member. Requiring OWNER everywhere would be *stricter* than
 * the browser, which is still a divergence.
 *
 * A platform admin reaches every Space and is treated as the owner of every lab in it. That is
 * the browser's behaviour and is deliberately kept — but it means a token held by a Gencovery
 * admin can read any tenant's logs, which is why {@link audit} writes a line per call saying
 * whether that shortcut applied.
 */
@Injectable()
export class CnMcpLabTool {
  private readonly logger = new Logger(CnMcpLabTool.name);

  constructor(
    private readonly session: CnMcpSession,
    private readonly labAggregateService: CnLabAggregateService
  ) {}

  @Tool({
    name: CN_MCP_TOOL_LAB_FIND,
    description:
      'Find labs in one Space, most recently changed first, and say for each whether this ' +
      'account can debug it. Start here: every other lab tool takes an id from this one. ' +
      '`canDebug` is false when the account is not an owner of that lab — the diagnosis and ' +
      'log tools will refuse it, so do not call them on a row where it is false.',
    parameters: z.object({
      spaceId: CN_MCP_SPACE_ID_PARAMETER,
      query: z.string().optional().describe('Match against the lab name. Omit to list them all.'),
      status: z
        .nativeEnum(CnLabStatus)
        .optional()
        .describe('Keep only labs currently in this status. LAB_RUNNING means fully started.'),
      type: z
        .nativeEnum(CnLabType)
        .optional()
        .describe('Keep only labs of this type. The start diagnosis applies to CLOUD labs only.'),
      limit: z.number().int().min(1).max(50).default(20).describe('Maximum labs to return.'),
    }),
    annotations: { readOnlyHint: true },
  })
  async find(
    {
      spaceId,
      query,
      status,
      type,
      limit,
    }: { spaceId: string; query?: string; status?: CnLabStatus; type?: CnLabType; limit: number },
    _context: unknown,
    request: CnRequest
  ): Promise<CnMcpToolResponse> {
    return this.session.inSpace(request, spaceId, async (userInfo) => {
      this.audit(CN_MCP_TOOL_LAB_FIND, userInfo, null);

      const searchParams = new BlSearchParams(
        [
          ...(query ? [{ key: 'name', operator: 'CONTAINS' as const, value: query }] : []),
          ...(status ? [{ key: 'currentStatus.status', operator: 'EQ' as const, value: status }] : []),
          ...(type ? [{ key: 'type', operator: 'EQ' as const, value: type }] : []),
        ],
        [{ key: 'lastModifiedAt', direction: 'DESC' as const }]
      );

      const labs = await this.labAggregateService.searchReachableInCurrentSpace(searchParams, 0, limit);

      // The list is not restricted to labs the caller can debug: the browser shows them, and
      // hiding them here would make a lab the user can see look as though it did not exist.
      // The flag is what keeps that from costing the model a refusal it could have avoided.
      const manageable = new Set(
        await this.labAggregateService.filterLabIdsManageableByCurrentUser(labs.objects.map((lab) => lab.id))
      );

      return cnMcpJson({
        space: { id: userInfo.space.id, name: userInfo.space.name },
        count: labs.objects.length,
        totalElements: labs.totalElements,
        labs: labs.objects.map((lab) => cnMcpLabRow(lab, manageable.has(lab.id))),
      });
    });
  }

  @Tool({
    name: CN_MCP_TOOL_LAB_DIAGNOSE_START,
    description:
      'Say which of the six layers of a cloud lab start is blocked, and why. Call this first ' +
      'when a lab does not start, before reading any log: `blockedAtLayer` tells you which ' +
      'layer to investigate, and reading a deeper one is wasted effort while an earlier one is ' +
      'down. Reads only — it starts nothing and changes no state. Layers that cannot be reached ' +
      'in time come back as "unknown" rather than failing the whole answer. Requires the lab ' +
      'owner role, and only applies to CLOUD labs.',
    parameters: z.object({ spaceId: CN_MCP_SPACE_ID_PARAMETER, labId: labIdParameter }),
    annotations: { readOnlyHint: true },
  })
  async diagnoseStart(
    { spaceId, labId }: { spaceId: string; labId: string },
    _context: unknown,
    request: CnRequest
  ): Promise<CnMcpToolResponse> {
    return this.session.inSpace(request, spaceId, async (userInfo) => {
      this.audit(CN_MCP_TOOL_LAB_DIAGNOSE_START, userInfo, labId);

      const diagnosis = await this.asLabOwner(CN_MCP_TOOL_LAB_DIAGNOSE_START, userInfo, labId, () =>
        this.labAggregateService.diagnoseLabStart(labId)
      );

      return cnMcpJson({
        labId,
        ...cnMcpDiagnosisPayload(diagnosis),
      });
    });
  }

  @Tool({
    name: CN_MCP_TOOL_LAB_GET_START_ERRORS,
    description:
      "Read the lab's own start error log, as the lab manager recorded it. Useful once " +
      `${CN_MCP_TOOL_LAB_DIAGNOSE_START} reports the lab layer as the blocked one; while the ` +
      'lab manager itself is down there is nothing here to read. `mainErrors` is the lab ' +
      "manager's own summary and is the place to start. Requires the lab owner role.",
    parameters: z.object({
      spaceId: CN_MCP_SPACE_ID_PARAMETER,
      labId: labIdParameter,
      maxLines: z
        .number()
        .int()
        .min(1)
        .max(2000)
        .default(200)
        .describe('Keep only the last N lines of the log. `totalLines` says how long it really is.'),
    }),
    annotations: { readOnlyHint: true },
  })
  async getStartErrors(
    { spaceId, labId, maxLines }: { spaceId: string; labId: string; maxLines: number },
    _context: unknown,
    request: CnRequest
  ): Promise<CnMcpToolResponse> {
    return this.session.inSpace(request, spaceId, async (userInfo) => {
      this.audit(CN_MCP_TOOL_LAB_GET_START_ERRORS, userInfo, labId);

      const errorLogs = await this.asLabOwner(CN_MCP_TOOL_LAB_GET_START_ERRORS, userInfo, labId, () =>
        this.labAggregateService.getStartingError(labId)
      );

      return cnMcpJson({ labId, ...cnMcpStartErrorsPayload(errorLogs, maxLines) });
    });
  }

  @Tool({
    name: CN_MCP_TOOL_LAB_LIST_CONTAINERS,
    description:
      'List every container of the lab, across every brick, with its status and exit code. ' +
      `This is what produces the \`containerName\` that ${CN_MCP_TOOL_LAB_CONTAINER_LOGS} ` +
      'requires — never guess one. Set `onlyNotRunning` to see just the containers that are ' +
      'down, which on a lab that fails to start is usually the whole answer. Works on cloud and ' +
      'on-premise labs. Requires the lab owner role.',
    parameters: z.object({
      spaceId: CN_MCP_SPACE_ID_PARAMETER,
      labId: labIdParameter,
      onlyNotRunning: z
        .boolean()
        .default(false)
        .describe('Keep only containers that are not running. `totalCount` still counts them all.'),
    }),
    annotations: { readOnlyHint: true },
  })
  async listContainers(
    { spaceId, labId, onlyNotRunning }: { spaceId: string; labId: string; onlyNotRunning: boolean },
    _context: unknown,
    request: CnRequest
  ): Promise<CnMcpToolResponse> {
    return this.session.inSpace(request, spaceId, async (userInfo) => {
      this.audit(CN_MCP_TOOL_LAB_LIST_CONTAINERS, userInfo, labId);

      const containers = await this.asLabOwner(CN_MCP_TOOL_LAB_LIST_CONTAINERS, userInfo, labId, () =>
        this.labAggregateService.getAllLabContainers(labId)
      );

      return cnMcpJson({ labId, ...cnMcpContainersPayload(containers, onlyNotRunning) });
    });
  }

  @Tool({
    name: CN_MCP_TOOL_LAB_CONTAINER_LOGS,
    description:
      "Read one container's logs, filtered on the lab where possible. Take `containerName` " +
      `from ${CN_MCP_TOOL_LAB_LIST_CONTAINERS}. \`tail\` means "the last N lines that match ` +
      'the pattern", not "the pattern within the last N lines" — so a pattern on a container ' +
      'that has been failing for hours still finds it. Check `filteredLocally` in the answer: ' +
      'when it is true this lab cannot filter server-side, only `tail` was applied, and an ' +
      'empty result says nothing about whether the pattern occurs. Requires the lab owner role.',
    parameters: z.object({
      spaceId: CN_MCP_SPACE_ID_PARAMETER,
      labId: labIdParameter,
      containerName: z.string().min(1).describe(`Exactly as returned by ${CN_MCP_TOOL_LAB_LIST_CONTAINERS}.`),
      tail: z.number().int().min(1).max(2000).default(200).describe('Maximum lines to return.'),
      pattern: z.string().optional().describe('Keep only lines matching this.'),
      patternMode: z.enum(['substring', 'regex']).default('substring').describe('How `pattern` is matched.'),
      caseSensitive: z.boolean().default(false).describe('Whether `pattern` is case sensitive.'),
      contextLines: z
        .number()
        .int()
        .min(0)
        .max(20)
        .default(0)
        .describe('Lines of context to keep around each match.'),
      since: z
        .string()
        .optional()
        .describe('Only lines after this instant. Docker syntax: an ISO timestamp, or "10m".'),
      errorsOnly: z.boolean().default(false).describe('Keep only lines the lab reads as errors.'),
    }),
    annotations: { readOnlyHint: true },
  })
  async containerLogs(
    args: {
      spaceId: string;
      labId: string;
      containerName: string;
      tail: number;
      pattern?: string;
      patternMode: 'substring' | 'regex';
      caseSensitive: boolean;
      contextLines: number;
      since?: string;
      errorsOnly: boolean;
    },
    _context: unknown,
    request: CnRequest
  ): Promise<CnMcpToolResponse> {
    return this.session.inSpace(request, args.spaceId, async (userInfo) => {
      this.audit(CN_MCP_TOOL_LAB_CONTAINER_LOGS, userInfo, args.labId);

      const search = await this.asLabOwner(CN_MCP_TOOL_LAB_CONTAINER_LOGS, userInfo, args.labId, () =>
        this.labAggregateService.searchContainerLogs(args.labId, args.containerName, {
          tail: args.tail,
          pattern: args.pattern,
          patternMode: args.patternMode,
          caseSensitive: args.caseSensitive,
          contextLines: args.contextLines,
          since: args.since,
          errorsOnly: args.errorsOnly,
        })
      );

      return cnMcpJson({
        labId: args.labId,
        containerName: args.containerName,
        ...cnMcpContainerLogsPayload(search),
      });
    });
  }

  @Tool({
    name: CN_MCP_TOOL_LAB_STATUS_TIMELINE,
    description:
      'Read how the lab got to its current status, and whether it has ever run at all. ' +
      '`everStarted` covers the whole history and answers the question that changes everything ' +
      'else: a lab that has never started is a setup problem, one that used to start is a ' +
      'regression. Any member of the lab can call this.',
    parameters: z.object({
      spaceId: CN_MCP_SPACE_ID_PARAMETER,
      labId: labIdParameter,
      limit: z.number().int().min(1).max(100).default(30).describe('Most recent status changes to return.'),
    }),
    annotations: { readOnlyHint: true },
  })
  async statusTimeline(
    { spaceId, labId, limit }: { spaceId: string; labId: string; limit: number },
    _context: unknown,
    request: CnRequest
  ): Promise<CnMcpToolResponse> {
    return this.session.inSpace(request, spaceId, async (userInfo) => {
      this.audit(CN_MCP_TOOL_LAB_STATUS_TIMELINE, userInfo, labId);

      const timeline = await this.asLabMember(CN_MCP_TOOL_LAB_STATUS_TIMELINE, userInfo, labId, () =>
        this.labAggregateService.getLabStatusTimeline(labId, limit)
      );

      return cnMcpJson({ labId, ...cnMcpTimelinePayload(timeline) });
    });
  }

  /**
   * The one tool here that is not a read.
   *
   * No `readOnlyHint`, and the side effect stated in the description, because reconciling the
   * status writes one and a status change to `SERVER_CONFIGURED` makes the Space API configure
   * and start the lab's bricks. That is usually the desired fix, which is why the tool exists;
   * suppressing the brick start for machine callers was rejected, because a listener that
   * behaves differently depending on who called it is the kind of hidden coupling that rots.
   */
  @Tool({
    name: CN_MCP_TOOL_LAB_REFRESH_STATUS,
    description:
      'Reconcile the lab status against its actual server, then report the layers. NOT a ' +
      'read-only call: it writes the reconciled status, and reconciling a lab whose server is ' +
      'ready CAN START ITS CONTAINERS. That is often the fix for a lab stuck part-way through ' +
      'starting, but say so to the user before calling it. It reports the layers it can see ' +
      `without the owner-only probes; ${CN_MCP_TOOL_LAB_DIAGNOSE_START} is the full six-layer ` +
      'read. Any member of the lab can call this, and it applies to CLOUD labs only.',
    parameters: z.object({ spaceId: CN_MCP_SPACE_ID_PARAMETER, labId: labIdParameter }),
  })
  async refreshStatus(
    { spaceId, labId }: { spaceId: string; labId: string },
    _context: unknown,
    request: CnRequest
  ): Promise<CnMcpToolResponse> {
    return this.session.inSpace(request, spaceId, async (userInfo) => {
      this.audit(CN_MCP_TOOL_LAB_REFRESH_STATUS, userInfo, labId);

      const diagnosis = await this.asLabMember(CN_MCP_TOOL_LAB_REFRESH_STATUS, userInfo, labId, () =>
        this.labAggregateService.refreshAndDescribeLabStart(labId)
      );

      return cnMcpJson({
        labId,
        refreshed: true,
        ...cnMcpDiagnosisPayload(diagnosis),
      });
    });
  }

  //////////////////////////////// REFUSALS AND AUDIT ////////////////////////////////

  private asLabOwner<T>(
    toolName: string,
    userInfo: CnUserSpaceInfo,
    labId: string,
    run: () => Promise<T>
  ): Promise<T> {
    return this.withNamedRefusals(toolName, userInfo, labId, CnLabUserRole.OWNER, run);
  }

  private asLabMember<T>(
    toolName: string,
    userInfo: CnUserSpaceInfo,
    labId: string,
    run: () => Promise<T>
  ): Promise<T> {
    return this.withNamedRefusals(toolName, userInfo, labId, 'any role on the lab', run);
  }

  /**
   * Run a lab operation and rewrite its refusals into something a model can act on.
   *
   * Two refusals need rewriting, and for the same reason: the answer a model gets back is the
   * only thing that tells it what to do next.
   *
   * A role refusal from the aggregate carries no message, and a bare 401 reads to a model as a
   * broken lab — it will start diagnosing a problem that does not exist. So the role actually
   * held is looked up (through the member-level read, which is the weaker sibling of the check
   * that just refused) and both roles are named. The extra query only happens on the refusal
   * path.
   *
   * A non-cloud lab is refused by the aggregate with the lab's type; the message is rewritten
   * here because naming the tools that still apply is MCP vocabulary, which has no business in
   * `cn-labs`.
   */
  private async withNamedRefusals<T>(
    toolName: string,
    userInfo: CnUserSpaceInfo,
    labId: string,
    requiredRole: string,
    run: () => Promise<T>
  ): Promise<T> {
    try {
      return await run();
    } catch (error) {
      if (error instanceof CnLabNotCloudException) {
        throw new CnLabNotCloudException(error.labType, CN_MCP_LAB_NOT_CLOUD_MESSAGE);
      }
      if (error instanceof BlUnauthorizedException) {
        throw new BlUnauthorizedException(
          cnMcpLabRoleRefusal(await this.heldRole(labId), requiredRole, toolName, labId, userInfo.spaceId)
        );
      }
      throw error;
    }
  }

  /**
   * The role the caller holds on the lab, or null when they hold none the platform will admit to.
   *
   * Null covers two cases on purpose, because this lookup cannot tell them apart either: a lab
   * the account was never added to, and a lab that belongs to a different Space than the one the
   * call named. The refusal states both.
   */
  private async heldRole(labId: string): Promise<string | null> {
    return this.labAggregateService
      .findByIdAndCheck(labId)
      .then((found) => String(found.userRole))
      .catch(() => null);
  }

  /**
   * One line per call, before the lab is touched.
   *
   * This is the whole of the audit story here — there is no table. It exists because a platform
   * admin's token reaches every tenant through this endpoint, and `adminShortcut` is the field
   * that makes that property reviewable afterwards rather than merely disclosed. Written before
   * the work so a refused call is audited too: a cross-tenant attempt is the interesting one.
   */
  private audit(toolName: string, userInfo: CnUserSpaceInfo, labId: string | null): void {
    this.logger.log(
      `MCP lab tool=${toolName} labId=${labId ?? '-'} spaceId=${userInfo.spaceId} ` +
        `userId=${userInfo.userId} roleInSpace=${userInfo.roleInSpace} ` +
        `adminShortcut=${userInfo.isAdmin()}`
    );
  }
}
