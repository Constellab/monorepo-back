import {
  CnLabManagerDockerLogSearch,
  CnLabManagerErrorLogs,
} from '../cn-external-lab-api/model/cn-lab-manager.class';
import { CnLabContainerDTO, CnLabContainerListDTO, CnLabStatusTimelineDTO } from '../cn-labs/cn-lab.dto';
import { CnLabFull, CnLabWithSpace } from '../cn-labs/cn-lab.entity';
import {
  CnLabStartDiagnosis,
  CnLabStartDiagnosisResult,
  CnLabStartLayerName,
} from '../cn-labs/diagnosis/cn-lab-start-diagnosis.dto';
import {
  CN_MCP_TOOL_LAB_CONTAINER_LOGS,
  CN_MCP_TOOL_LAB_DIAGNOSE_START,
  CN_MCP_TOOL_LAB_GET_START_ERRORS,
  CN_MCP_TOOL_LAB_LIST_CONTAINERS,
  CN_MCP_TOOL_LAB_REFRESH_STATUS,
  CN_MCP_TOOL_LAB_STATUS_TIMELINE,
} from './cn-mcp.constants';

/**
 * Every payload the lab tools return, built field by field.
 *
 * Field by field and never by serializing an entity: `CnLabEntity` carries the lab's glab api
 * keys, its database passwords, its codelab token and its lab manager api key. The `@Exclude()`
 * decorators that keep those out of an HTTP response are class-transformer's, and a tool that
 * did `JSON.stringify(lab)` would hand every one of them to a language model. There is no way
 * to make that safe by remembering to be careful, so the entity never reaches a payload at
 * all — these functions are the only way a lab becomes text here.
 */

/**
 * The lab, as every payload here names it.
 *
 * Four of these fields — `serverTaskStatus`, and `serverTaskText` / `serverTaskDatetime` /
 * `dnsConfigured` where other payloads carry them — are `@Exclude()`d on `CnLabEntity` and still
 * returned on purpose. That decorator keeps them out of the *lab* HTTP payload, where they are
 * noise; the browser reads the same fields from the lab status endpoint, which is the operation
 * these tools stand in for. They are also the fields that say a lab is mid-start rather than
 * broken, and a diagnosis without them would have a model reading logs on a lab whose start is
 * still running. The six credentials the entity carries are a different matter entirely and
 * appear in no payload, which is what the tests assert.
 */
export interface CnMcpLabSummary {
  id: string;
  name: string;
  type: string;
  virtualHost: string | null;
  status: string | null;
  serverTaskStatus: string;
  lastModifiedAt: string | null;
}

export function cnMcpLabSummary(lab: CnLabWithSpace): CnMcpLabSummary {
  return {
    id: lab.id,
    name: lab.name,
    type: lab.type,
    virtualHost: lab.virtualHost,
    status: lab.currentStatus?.status ?? null,
    serverTaskStatus: lab.serverTaskStatus,
    lastModifiedAt: lab.lastModifiedAt?.toISO() ?? null,
  };
}

/** One row of a lab list. `canDebug` is whether the caller holds OWNER on this lab. */
export type CnMcpLabRow = CnMcpLabSummary & { canDebug: boolean };

export function cnMcpLabRow(lab: CnLabFull, canDebug: boolean): CnMcpLabRow {
  return { ...cnMcpLabSummary(lab), canDebug };
}

/**
 * A guess at what is wrong, and the tool that would confirm it.
 *
 * `nextTool` is what makes the tool set closed: a model that reads a hypothesis is told which
 * call answers it, and never has to invent one.
 */
export interface CnMcpLabHypothesis {
  layer: CnLabStartLayerName | 'none';
  hypothesis: string;
  nextTool: string | null;
}

/**
 * The most likely causes for the layer the start is blocked at.
 *
 * This is the least defensible part of the diagnosis and is meant to be read as such: these
 * seven tools were designed without ever being pointed at a real failing lab, so the list is a
 * bet on which causes occur most often, not a fact. Two or three real incidents will say
 * whether it should be enriched or dropped — it is not settled, and nothing else in the
 * verdict depends on it.
 */
export function cnMcpLabHypotheses(diagnosis: CnLabStartDiagnosis): CnMcpLabHypothesis[] {
  const blocked = diagnosis.blockedAtLayer;
  if (blocked == null) {
    // Nothing probed is blocking. Whether that is the whole story depends on how much was
    // probed, and a caller that read four layers must not be told the lab is fine.
    if (diagnosis.notProbedLayers.length > 0) {
      return [
        {
          layer: 'none',
          hypothesis:
            `Every layer that was read answers ok, but ${diagnosis.notProbedLayers.join(' and ')} ` +
            `were not read at all, so this is not a clean bill of health. Reading them needs the ` +
            `lab owner role; if this account does not hold it, a lab owner has to run the full ` +
            `diagnosis.`,
          nextTool: CN_MCP_TOOL_LAB_DIAGNOSE_START,
        },
      ];
    }

    return [
      {
        layer: 'none',
        hypothesis:
          'Every layer answers ok. If a user still cannot use the lab, the problem is above ' +
          'these six layers — their browser session, their role on the lab, or a brick that ' +
          'runs but misbehaves.',
        nextTool: CN_MCP_TOOL_LAB_LIST_CONTAINERS,
      },
    ];
  }

  const layer = diagnosis.layers[blocked];
  if (layer.status === 'unknown') {
    return [
      {
        layer: blocked,
        hypothesis:
          `The ${blocked} layer answered nothing, so no cause can be proposed for it. ` +
          `Everything below it is unread rather than healthy. Retry the diagnosis before ` +
          `concluding anything: ${layer.reason}`,
        nextTool: CN_MCP_TOOL_LAB_DIAGNOSE_START,
      },
    ];
  }

  const byLayer: Record<CnLabStartLayerName, CnMcpLabHypothesis[]> = {
    spaceDb: [
      {
        layer: 'spaceDb',
        hypothesis:
          'A server task is held open by a process that no longer exists — a restart of the ' +
          'Space API while the task ran, most often. Nothing else may run on the lab while the ' +
          'task is open, so this blocks the start without being its cause.',
        nextTool: CN_MCP_TOOL_LAB_REFRESH_STATUS,
      },
      {
        layer: 'spaceDb',
        hypothesis:
          'Or the lab is genuinely stopped and was never asked to start. Its status history ' +
          'says which of the two it is: a stop written by a user, or a status that drifted.',
        nextTool: CN_MCP_TOOL_LAB_STATUS_TIMELINE,
      },
    ],
    cloud: [
      {
        layer: 'cloud',
        hypothesis:
          'The start sequence stopped part-way through creating the server: instances, volumes ' +
          'and the volume attachment are created in that order, so the first missing one is ' +
          'where it died. A quota refusal at the cloud provider is the usual reason.',
        nextTool: CN_MCP_TOOL_LAB_REFRESH_STATUS,
      },
    ],
    dns: [
      {
        layer: 'dns',
        hypothesis:
          'Either the DNS record creation step never ran, or it ran and has not propagated. ' +
          'Propagation resolves itself within minutes; a missing record does not, and the ' +
          'server is unreachable by name until it exists.',
        nextTool: CN_MCP_TOOL_LAB_DIAGNOSE_START,
      },
    ],
    ssh: [
      {
        layer: 'ssh',
        hypothesis:
          'The instance runs but nothing answers on it: it may still be booting, its ssh ' +
          'daemon may not have come up, or the volume mount may have failed early enough to ' +
          'leave the machine in an unusable state.',
        nextTool: CN_MCP_TOOL_LAB_STATUS_TIMELINE,
      },
    ],
    labManager: [
      {
        layer: 'labManager',
        hypothesis:
          'The server is reachable but the lab manager is not up, so the configuration steps ' +
          'that run over ssh are what failed: the lab-configurer clone, prepare_server.sh, ' +
          'init.sh or the docker compose that starts the lab manager itself.',
        nextTool: CN_MCP_TOOL_LAB_REFRESH_STATUS,
      },
      {
        layer: 'labManager',
        hypothesis:
          'The lab manager is not the layer that can report its own failure. Its start error ' +
          'log is unreachable while it is down; the status history is what says when it last ' +
          'worked.',
        nextTool: CN_MCP_TOOL_LAB_STATUS_TIMELINE,
      },
    ],
    glab: [
      {
        layer: 'glab',
        hypothesis:
          'The lab manager is up and the lab bricks are what failed to start. This is the one ' +
          'layer whose failure is written down in full: the start error log names it.',
        nextTool: CN_MCP_TOOL_LAB_GET_START_ERRORS,
      },
      {
        layer: 'glab',
        hypothesis:
          'A single container is the usual culprit — one brick exiting non-zero takes the lab ' +
          'down with it. The container list says which, and its logs say why.',
        nextTool: CN_MCP_TOOL_LAB_LIST_CONTAINERS,
      },
    ],
  };

  return byLayer[blocked];
}

export function cnMcpDiagnosisPayload(result: CnLabStartDiagnosisResult): Record<string, unknown> {
  const { lab, diagnosis } = result;

  return {
    // The lab, not just its id: a verdict a model is going to repeat to a user has to name which
    // lab it is about, and its type and status are what make the verdict readable.
    lab: cnMcpLabSummary(lab),
    layers: diagnosis.layers,
    blockedAtLayer: diagnosis.blockedAtLayer,
    hasUnknownLayer: diagnosis.hasUnknownLayer,
    notProbedLayers: diagnosis.notProbedLayers,
    hypotheses: cnMcpLabHypotheses(diagnosis),
  };
}

/**
 * The lab manager's start error log, kept to its last `maxLines` lines.
 *
 * `totalLines` is reported next to `truncated` so a cut log cannot be mistaken for the whole
 * one: a model that reads the last 200 lines of 40 000 and concludes "the log contains no
 * error" has been misled by the payload, not by the lab.
 */
export function cnMcpStartErrorsPayload(
  errorLogs: CnLabManagerErrorLogs,
  maxLines: number
): Record<string, unknown> {
  const lines = (errorLogs.logs ?? '').split('\n');
  const kept = lines.length > maxLines ? lines.slice(-maxLines) : lines;

  return {
    mainErrors: errorLogs.mainErrors ?? [],
    logs: kept.join('\n'),
    totalLines: lines.length,
    returnedLines: kept.length,
    truncated: kept.length < lines.length,
  };
}

export function cnMcpContainersPayload(
  list: CnLabContainerListDTO,
  onlyNotRunning: boolean
): Record<string, unknown> {
  const containers = onlyNotRunning
    ? list.containers.filter((container) => container.status !== 'running')
    : list.containers;

  return {
    count: containers.length,
    totalCount: list.containers.length,
    onlyNotRunning,
    containers: containers.map((container) => cnMcpContainerRow(container)),
    unreadableComposes: list.unreadableComposes,
    // Spelled out because it is the one contract between two tools: whatever a model does with
    // the rest of the row, this is the field the log tool takes.
    containerNameUsableWith: CN_MCP_TOOL_LAB_CONTAINER_LOGS,
  };
}

function cnMcpContainerRow(container: CnLabContainerDTO): Record<string, unknown> {
  return {
    brickName: container.brickName,
    uniqueName: container.uniqueName,
    env: container.env,
    containerName: container.containerName,
    status: container.status,
    exitCode: container.exitCode,
    image: container.image,
    startedAt: container.startedAt,
  };
}

/**
 * A container's logs as lines, with what was applied to get them.
 *
 * `filteredLocally` is the field that matters: when it is true the lab manager has no
 * `logs/search` route, so `pattern`, `since` and `contextLines` were *not* applied and the
 * result is a plain tail. Without it, an empty result would read as "nothing matched".
 */
export function cnMcpContainerLogsPayload(search: CnLabManagerDockerLogSearch): Record<string, unknown> {
  const logs = search.logs ?? '';

  return {
    lines: logs.length === 0 ? [] : logs.split('\n'),
    matchedLines: search.matchedLines,
    totalLines: search.totalLines,
    returnedLines: search.returnedLines,
    truncated: search.truncated,
    truncatedBy: search.truncatedBy ?? null,
    window: search.window ?? null,
    filteredLocally: search.filteredLocally,
    ...(search.filteredLocally
      ? {
          filteredLocallyMeaning:
            'This lab manager has no server-side log search, so only `tail` was applied: ' +
            '`pattern`, `since` and `contextLines` were ignored. An empty or ' +
            'unfiltered result here says nothing about whether the pattern occurs in the log.',
        }
      : {}),
  };
}

export function cnMcpTimelinePayload(timeline: CnLabStatusTimelineDTO): Record<string, unknown> {
  return {
    everStarted: timeline.everStarted,
    history: timeline.history.map((row) => ({
      status: row.status,
      at: row.createdAt?.toISO() ?? null,
      endedAt: row.endDate?.toISO() ?? null,
      byUser: row.createdBy ? `${row.createdBy.firstname} ${row.createdBy.lastname}`.trim() : null,
    })),
    serverTask: {
      status: timeline.serverTaskStatus,
      text: timeline.serverTaskText,
      at: timeline.serverTaskDatetime?.toISO() ?? null,
    },
  };
}
