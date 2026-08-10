import 'reflect-metadata';

import { BlBadRequestException, BlUnauthorizedException, BlUserCategory } from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import { MCP_TOOL_METADATA_KEY } from '@rekog/mcp-nest';
import { DateTime } from 'luxon';

import { CnErrorText } from '../cn-core/model/config/cn-error-text.class';
import { CnRequest } from '../cn-core/utils/cn-current-user.helper';
import { CnLabManagerComposeEnv } from '../cn-external-lab-api/model/cn-lab-manager.class';
import { CnLabEntity, CnLabFull, CnLabType } from '../cn-labs/cn-lab.entity';
import { CnLabAggregateService } from '../cn-labs/cn-lab-aggregate.service';
import { CnLabNotCloudException } from '../cn-labs/diagnosis/cn-lab-not-cloud.exception';
import {
  CnLabStartDiagnosis,
  CnLabStartDiagnosisResult,
  CnLabStartLayer,
  CnLabStartLayerName,
} from '../cn-labs/diagnosis/cn-lab-start-diagnosis.dto';
import { CnLabServerTaskStatus, CnLabStatus } from '../cn-labs/status/cn-lab-status.enum';
import { CnLabStatusHistory } from '../cn-labs/status/cn-lab-status-history.entity';
import { CnLabUserRole } from '../cn-labs/user/cn-lab-user.entity';
import { CnSpace } from '../cn-spaces/cn-space.entity';
import { CnSpaceService } from '../cn-spaces/cn-space.service';
import { CnSpaceUserRole } from '../cn-spaces/cn-space-user.entity';
import { CnSpaceUserService } from '../cn-spaces/cn-space-user.service';
import { CnUser } from '../cn-users/cn-user.entity';
import {
  CN_MCP_TOOL_LAB_CONTAINER_LOGS,
  CN_MCP_TOOL_LAB_DIAGNOSE_START,
  CN_MCP_TOOL_LAB_GET_START_ERRORS,
  CN_MCP_TOOL_LAB_LIST_CONTAINERS,
  CN_MCP_TOOL_LAB_STATUS_TIMELINE,
} from './cn-mcp.constants';
import { CnMcpLabTool } from './cn-mcp-lab.tool';
import { CnMcpSession } from './cn-mcp-session.service';
import { CnMcpToolResponse } from './cn-mcp-tool.helper';

/**
 * The lab diagnosis tools, from the outside: what a model actually receives.
 *
 * Three properties are load-bearing and none of them is visible from the aggregate service the
 * tools call. A refusal has to name both roles, or the model reads it as a broken lab and
 * starts diagnosing a problem that does not exist. A payload has to carry no credential, and
 * the entity carries six. And a call has to leave an audit line, because a platform admin's
 * token reaches every Space through this endpoint.
 */
describe('CnMcpLabTool', () => {
  const SPACE_ID = 'space-1';
  const LAB_ID = 'lab-1';

  let aggregate: {
    searchReachableInCurrentSpace: jest.Mock;
    filterLabIdsManageableByCurrentUser: jest.Mock;
    diagnoseLabStart: jest.Mock;
    refreshAndDescribeLabStart: jest.Mock;
    getLabStatusTimeline: jest.Mock;
    getAllLabContainers: jest.Mock;
    searchContainerLogs: jest.Mock;
    getStartingError: jest.Mock;
    findByIdAndCheck: jest.Mock;
    // Present so the tests can assert they are never reached: these are the aggregate's
    // mutating entry points, and a diagnosis that touched one would start lab containers.
    checkAndRefreshStatus: jest.Mock;
    refreshLabStatus: jest.Mock;
    getLabStatus: jest.Mock;
  };
  let spaceService: { findById: jest.Mock };
  let spaceUserService: { getSpaceUserIfAccess: jest.Mock };
  let tool: CnMcpLabTool;
  let logged: string[];

  beforeEach(() => {
    aggregate = {
      searchReachableInCurrentSpace: jest.fn(),
      filterLabIdsManageableByCurrentUser: jest.fn().mockResolvedValue([]),
      diagnoseLabStart: jest.fn().mockResolvedValue(resultOf(diagnosisOf('cloud'))),
      refreshAndDescribeLabStart: jest.fn().mockResolvedValue(resultOf(diagnosisOf('labManager'))),
      getLabStatusTimeline: jest.fn(),
      getAllLabContainers: jest.fn(),
      searchContainerLogs: jest.fn(),
      getStartingError: jest.fn(),
      findByIdAndCheck: jest.fn(),
      checkAndRefreshStatus: jest.fn(),
      refreshLabStatus: jest.fn(),
      getLabStatus: jest.fn(),
    };
    spaceService = { findById: jest.fn().mockResolvedValue(makeSpace()) };
    spaceUserService = {
      getSpaceUserIfAccess: jest.fn().mockResolvedValue({ role: CnSpaceUserRole.USER }),
    };

    const session = new CnMcpSession(
      spaceService as unknown as CnSpaceService,
      spaceUserService as unknown as CnSpaceUserService
    );
    tool = new CnMcpLabTool(session, aggregate as unknown as CnLabAggregateService);

    // The audit line is a requirement of its own, so it is captured rather than silenced.
    logged = [];
    jest
      .spyOn(tool['logger'], 'log')
      .mockImplementation((message: unknown) => void logged.push(String(message)));
  });

  afterEach(() => jest.restoreAllMocks());

  function makeSpace(): CnSpace {
    return { id: SPACE_ID, name: 'Gencovery' } as unknown as CnSpace;
  }

  function makeUser(category: BlUserCategory = BlUserCategory.USER): CnUser {
    return {
      id: 'user-1',
      category,
      isAdmin: () => category === BlUserCategory.ADMIN,
    } as unknown as CnUser;
  }

  function requestOf(user: CnUser = makeUser()): CnRequest {
    return { user, res: {} } as unknown as CnRequest;
  }

  function diagnosisOf(
    blockedAtLayer: CnLabStartDiagnosis['blockedAtLayer'],
    notProbedLayers: CnLabStartLayerName[] = []
  ): CnLabStartDiagnosis {
    const ok = { status: 'ok' as const, reason: 'fine' };
    const layers: Record<CnLabStartLayerName, CnLabStartLayer> = {
      spaceDb: ok,
      cloud: ok,
      dns: ok,
      ssh: ok,
      labManager: ok,
      glab: ok,
    };
    for (const name of notProbedLayers) {
      layers[name] = { status: 'notProbed', reason: 'nobody looked' };
    }

    return { layers, blockedAtLayer, hasUnknownLayer: false, notProbedLayers };
  }

  function resultOf(diagnosis: CnLabStartDiagnosis): CnLabStartDiagnosisResult {
    return { lab: makeLab(), diagnosis };
  }

  function makeLab(overrides: Partial<CnLabEntity> = {}): CnLabFull {
    const lab = new CnLabEntity();
    lab.id = LAB_ID;
    lab.name = 'rio';
    lab.type = CnLabType.CLOUD;
    lab.virtualHost = 'rio.gencovery.io';
    lab.serverTaskStatus = CnLabServerTaskStatus.ERROR;
    lab.lastModifiedAt = DateTime.fromISO('2026-08-01T10:00:00Z');
    lab.currentStatus = { status: CnLabStatus.ERROR } as CnLabStatusHistory;
    lab.glabProdApiKey = 'PROD-API-KEY';
    lab.glabDevApiKey = 'DEV-API-KEY';
    lab.labManagerApiKey = 'LAB-MANAGER-KEY';
    lab.codelabToken = 'CODELAB-TOKEN';
    lab.gwsCoreProdDbPassword = 'PROD-DB-PASSWORD';
    lab.gwsCoreDevDbPassword = 'DEV-DB-PASSWORD';

    Object.assign(lab, overrides);
    return lab;
  }

  /** The one text block a tool answers with, parsed back into the object it was built from. */
  function payloadOf(response: CnMcpToolResponse): Record<string, any> {
    return JSON.parse(response.content[0].text) as Record<string, any>;
  }

  /**
   * What `@Tool` recorded for a handler.
   *
   * `SetMetadata` on a method attaches to the method function itself, which is why this reads
   * from the prototype's property rather than from the class with a key.
   */
  function toolMetadataOf(method: string): { description: string; annotations?: Record<string, unknown> } {
    const handler = (CnMcpLabTool.prototype as unknown as Record<string, unknown>)[method];
    const metadata = Reflect.getMetadata(MCP_TOOL_METADATA_KEY, handler as object) as {
      description: string;
      annotations?: Record<string, unknown>;
    };
    expect(metadata).toBeDefined();
    return metadata;
  }

  const LAB_CREDENTIALS = [
    'PROD-API-KEY',
    'DEV-API-KEY',
    'LAB-MANAGER-KEY',
    'CODELAB-TOKEN',
    'PROD-DB-PASSWORD',
    'DEV-DB-PASSWORD',
  ];

  describe('find', () => {
    beforeEach(() => {
      aggregate.searchReachableInCurrentSpace.mockResolvedValue(
        ClPage.fromPagination(0, 20, 2, [makeLab(), makeLab({ id: 'lab-2', name: 'oslo' })])
      );
    });

    it('flags per row whether the caller can debug that lab', async () => {
      // The list is deliberately wider than what the debug tools accept: it shows what the
      // browser shows. The flag is what keeps the model from spending a call on a refusal.
      aggregate.filterLabIdsManageableByCurrentUser.mockResolvedValue([LAB_ID]);

      const payload = payloadOf(await tool.find({ spaceId: SPACE_ID, limit: 20 }, undefined, requestOf()));

      expect(payload.labs.map((lab: any) => [lab.id, lab.canDebug])).toEqual([
        [LAB_ID, true],
        ['lab-2', false],
      ]);
    });

    it('turns the tool arguments into name, status and type filters', async () => {
      await tool.find(
        {
          spaceId: SPACE_ID,
          query: 'rio',
          status: CnLabStatus.ERROR,
          type: CnLabType.CLOUD,
          limit: 5,
        },
        undefined,
        requestOf()
      );

      const [searchParams, page, size] = aggregate.searchReachableInCurrentSpace.mock.calls[0];
      expect(searchParams.filtersCriteria).toEqual([
        { key: 'name', operator: 'CONTAINS', value: 'rio' },
        { key: 'currentStatus.status', operator: 'EQ', value: CnLabStatus.ERROR },
        { key: 'type', operator: 'EQ', value: CnLabType.CLOUD },
      ]);
      expect(searchParams.sortsCriteria).toEqual([{ key: 'lastModifiedAt', direction: 'DESC' }]);
      expect([page, size]).toEqual([0, 5]);
    });

    it('refuses without a Space rather than picking one', async () => {
      await expect(tool.find({ spaceId: '', limit: 20 }, undefined, requestOf())).rejects.toThrow(
        BlUnauthorizedException
      );
      expect(aggregate.searchReachableInCurrentSpace).not.toHaveBeenCalled();
    });
  });

  describe('diagnoseStart', () => {
    it('returns the lab, the six layers, the blocked one and what to call next', async () => {
      const payload = payloadOf(
        await tool.diagnoseStart({ spaceId: SPACE_ID, labId: LAB_ID }, undefined, requestOf())
      );

      // The lab and not only its id: a verdict a model repeats to a user has to name the lab it
      // is about, and the type is what says whether the six layers even apply.
      expect(payload.lab).toMatchObject({ id: LAB_ID, name: 'rio', type: CnLabType.CLOUD });
      expect(Object.keys(payload.layers).sort()).toEqual(
        ['cloud', 'dns', 'glab', 'labManager', 'spaceDb', 'ssh'].sort()
      );
      expect(payload.blockedAtLayer).toEqual('cloud');
      // The set is closed: every hypothesis names the tool that would confirm it, so there is
      // no argument the model has to invent.
      expect(payload.hypotheses.length).toBeGreaterThan(0);
      for (const hypothesis of payload.hypotheses) {
        expect(hypothesis.nextTool).toEqual(expect.stringContaining('constellab_lab_'));
      }
    });

    it('points at the start error log once the lab layer is the blocked one', async () => {
      aggregate.diagnoseLabStart.mockResolvedValue(resultOf(diagnosisOf('glab')));

      const payload = payloadOf(
        await tool.diagnoseStart({ spaceId: SPACE_ID, labId: LAB_ID }, undefined, requestOf())
      );

      expect(payload.hypotheses[0].nextTool).toEqual(CN_MCP_TOOL_LAB_GET_START_ERRORS);
    });

    it('reaches no aggregate method that could change the lab', async () => {
      await tool.diagnoseStart({ spaceId: SPACE_ID, labId: LAB_ID }, undefined, requestOf());

      // A status refresh writes a status history row, and a status change to SERVER_CONFIGURED
      // makes the space API configure and start the lab's bricks. `getLabStatus` is on the list
      // because it force-refreshes a lab marked stopped while the lab answers.
      expect(aggregate.checkAndRefreshStatus).not.toHaveBeenCalled();
      expect(aggregate.refreshLabStatus).not.toHaveBeenCalled();
      expect(aggregate.getLabStatus).not.toHaveBeenCalled();
    });

    it('names the role held and the role required when the caller is not an owner', async () => {
      aggregate.diagnoseLabStart.mockRejectedValue(new BlUnauthorizedException());
      // The caller is a lab member: enough to read the lab, not enough to diagnose it.
      aggregate.findByIdAndCheck.mockResolvedValue({ userRole: CnLabUserRole.USER });

      const refusal = await tool
        .diagnoseStart({ spaceId: SPACE_ID, labId: LAB_ID }, undefined, requestOf())
        .catch((error: Error) => error.message);

      expect(refusal).toContain(CnLabUserRole.USER);
      expect(refusal).toContain(CnLabUserRole.OWNER);
      // Without this the model reads a refusal as a symptom and diagnoses a lab that is fine.
      expect(refusal).toContain('not a fault of the lab');
    });

    it('offers both reasons when no role is found, including the wrong Space', async () => {
      aggregate.diagnoseLabStart.mockRejectedValue(new BlUnauthorizedException());
      aggregate.findByIdAndCheck.mockRejectedValue(new BlUnauthorizedException());

      const refusal = await tool
        .diagnoseStart({ spaceId: SPACE_ID, labId: LAB_ID }, undefined, requestOf())
        .catch((error: Error) => error.message);

      // A lab from another Space and a lab this account was never added to give the same
      // answer, deliberately — the platform will not confirm that a foreign lab id exists. Both
      // possible fixes are stated so the model does not settle on the wrong one, and it is told
      // the id was not quietly resolved into the Space that owns it.
      expect(refusal).toContain('has no role');
      expect(refusal).toContain('never added');
      expect(refusal).toContain('not in that Space');
      expect(refusal).toContain(SPACE_ID);
      expect(refusal).toContain(CnLabUserRole.OWNER);
      expect(refusal).toContain('not a fault of the lab');
    });

    it('refuses an on-premise lab by naming the tools that still apply', async () => {
      aggregate.diagnoseLabStart.mockRejectedValue(new CnLabNotCloudException(CnLabType.ON_PREMISE));

      const refusal = await tool
        .diagnoseStart({ spaceId: SPACE_ID, labId: LAB_ID }, undefined, requestOf())
        .catch((error: Error) => error.message);

      // A refusal with no next step is one the model retries verbatim. An on-premise lab has no
      // cloud layers but does run a lab manager, so its containers and logs are still readable.
      expect(refusal).toContain(CN_MCP_TOOL_LAB_LIST_CONTAINERS);
      expect(refusal).toContain(CN_MCP_TOOL_LAB_CONTAINER_LOGS);
      expect(refusal).toContain(CN_MCP_TOOL_LAB_STATUS_TIMELINE);
    });

    it('refuses a desktop lab without offering it the container tools', async () => {
      // A desktop lab never reaches the cloud check: the aggregate refuses to manage it first,
      // with a bare i18n key. Left alone, the one lab type the ticket names explicitly would be
      // the only one whose refusal says nothing — and offering it the container tools, which are
      // refused on a desktop lab too, would just buy a second refusal.
      aggregate.diagnoseLabStart.mockRejectedValue(
        new BlBadRequestException(CnErrorText.CANT_MANAGE_DESKTOP_LAB)
      );

      const refusal = await tool
        .diagnoseStart({ spaceId: SPACE_ID, labId: LAB_ID }, undefined, requestOf())
        .catch((error: Error) => error.message);

      expect(refusal).not.toEqual(CnErrorText.CANT_MANAGE_DESKTOP_LAB);
      expect(refusal).toContain('desktop lab');
      expect(refusal).toContain(CN_MCP_TOOL_LAB_STATUS_TIMELINE);
      expect(refusal).not.toContain(CN_MCP_TOOL_LAB_CONTAINER_LOGS);
    });
  });

  describe('getStartErrors', () => {
    it('reports how long the log really is next to the part it returned', async () => {
      const logs = Array.from({ length: 500 }, (_, index) => `line ${index}`).join('\n');
      aggregate.getStartingError.mockResolvedValue({ mainErrors: ['brick x failed'], logs });

      const payload = payloadOf(
        await tool.getStartErrors({ spaceId: SPACE_ID, labId: LAB_ID, maxLines: 200 }, undefined, requestOf())
      );

      // A model that reads the last 200 lines of 500 and concludes "no error in the log" was
      // misled by the payload, not by the lab.
      expect(payload.totalLines).toEqual(500);
      expect(payload.returnedLines).toEqual(200);
      expect(payload.truncated).toBe(true);
      expect(payload.logs.split('\n')[0]).toEqual('line 300');
      expect(payload.mainErrors).toEqual(['brick x failed']);
    });

    it('does not claim truncation when the log fits', async () => {
      aggregate.getStartingError.mockResolvedValue({ mainErrors: [], logs: 'one\ntwo' });

      const payload = payloadOf(
        await tool.getStartErrors({ spaceId: SPACE_ID, labId: LAB_ID, maxLines: 200 }, undefined, requestOf())
      );

      expect(payload.truncated).toBe(false);
      expect(payload.totalLines).toEqual(2);
    });
  });

  describe('listContainers', () => {
    beforeEach(() => {
      aggregate.getAllLabContainers.mockResolvedValue({
        containers: [
          {
            brickName: 'gws_core',
            uniqueName: 'main',
            env: CnLabManagerComposeEnv.PROD,
            containerName: 'gws_core_main_prod',
            status: 'running',
            exitCode: 0,
            image: 'gws_core:1.0',
            startedAt: '2026-08-01T10:00:00Z',
          },
          {
            brickName: 'gws_biolab',
            uniqueName: 'main',
            env: CnLabManagerComposeEnv.PROD,
            containerName: 'gws_biolab_main_prod',
            status: 'error',
            exitCode: 137,
            image: 'gws_biolab:1.0',
            startedAt: '2026-08-01T10:00:00Z',
          },
        ],
        unreadableComposes: [],
      });
    });

    it('returns container names the log tool takes as they are', async () => {
      const payload = payloadOf(
        await tool.listContainers(
          { spaceId: SPACE_ID, labId: LAB_ID, onlyNotRunning: false },
          undefined,
          requestOf()
        )
      );

      // This is the one contract between two tools: the log tool has no other source for the
      // name, so a row that could not be fed straight into it would leave the model inventing.
      expect(payload.containers.map((container: any) => container.containerName)).toEqual([
        'gws_core_main_prod',
        'gws_biolab_main_prod',
      ]);
      expect(payload.containerNameUsableWith).toEqual(CN_MCP_TOOL_LAB_CONTAINER_LOGS);
    });

    it('keeps the total count when filtering to the containers that are down', async () => {
      const payload = payloadOf(
        await tool.listContainers(
          { spaceId: SPACE_ID, labId: LAB_ID, onlyNotRunning: true },
          undefined,
          requestOf()
        )
      );

      expect(payload.containers).toHaveLength(1);
      expect(payload.containers[0].containerName).toEqual('gws_biolab_main_prod');
      // Otherwise a filtered list reads as "this lab has one container".
      expect(payload.totalCount).toEqual(2);
    });
  });

  describe('containerLogs', () => {
    const logArgs = {
      spaceId: SPACE_ID,
      labId: LAB_ID,
      containerName: 'gws_core_main_prod',
      tail: 200,
      patternMode: 'substring' as const,
      caseSensitive: false,
      contextLines: 0,
      errorsOnly: false,
    };

    it('passes every filter through to the lab manager', async () => {
      aggregate.searchContainerLogs.mockResolvedValue({
        logs: 'boom',
        totalLines: 1,
        matchedLines: 1,
        returnedLines: 1,
        truncated: false,
        filteredLocally: false,
      });

      await tool.containerLogs(
        { ...logArgs, pattern: 'Traceback', contextLines: 3, since: '10m' },
        undefined,
        requestOf()
      );

      expect(aggregate.searchContainerLogs).toHaveBeenCalledWith(LAB_ID, 'gws_core_main_prod', {
        tail: 200,
        pattern: 'Traceback',
        patternMode: 'substring',
        caseSensitive: false,
        contextLines: 3,
        since: '10m',
        errorsOnly: false,
      });
    });

    it('says so when the filters were not applied', async () => {
      // The degraded read a lab manager without the search route produces.
      aggregate.searchContainerLogs.mockResolvedValue({
        logs: 'line a\nline b',
        totalLines: 4000,
        matchedLines: 4000,
        returnedLines: 2,
        truncated: true,
        truncatedBy: 'tail',
        filteredLocally: true,
      });

      const payload = payloadOf(
        await tool.containerLogs({ ...logArgs, pattern: 'Traceback' }, undefined, requestOf())
      );

      expect(payload.filteredLocally).toBe(true);
      // Without this, an empty or unfiltered answer reads as "the pattern does not occur".
      expect(payload.filteredLocallyMeaning).toContain('pattern');
      expect(payload.lines).toEqual(['line a', 'line b']);
      expect(payload.totalLines).toEqual(4000);
      expect(payload.truncated).toBe(true);
    });

    it('returns no line at all for an empty log rather than one empty line', async () => {
      aggregate.searchContainerLogs.mockResolvedValue({
        logs: '',
        totalLines: 0,
        matchedLines: 0,
        returnedLines: 0,
        truncated: false,
        filteredLocally: false,
      });

      const payload = payloadOf(await tool.containerLogs(logArgs, undefined, requestOf()));

      expect(payload.lines).toEqual([]);
    });
  });

  describe('statusTimeline', () => {
    it('answers "has this lab ever run" over the whole history, not the page', async () => {
      aggregate.getLabStatusTimeline.mockResolvedValue({
        everStarted: true,
        history: [
          {
            status: CnLabStatus.ERROR,
            createdAt: DateTime.fromISO('2026-08-01T10:00:00Z'),
            endDate: null,
            createdBy: { firstname: 'Ada', lastname: 'Lovelace' },
          },
        ],
        serverTaskStatus: CnLabServerTaskStatus.ERROR,
        serverTaskText: 'Error during server configuration',
        serverTaskDatetime: DateTime.fromISO('2026-08-01T09:59:00Z'),
      });

      const payload = payloadOf(
        await tool.statusTimeline({ spaceId: SPACE_ID, labId: LAB_ID, limit: 30 }, undefined, requestOf())
      );

      // A lab that has never started is a setup problem; one that used to start is a regression.
      expect(payload.everStarted).toBe(true);
      expect(payload.history[0]).toMatchObject({ status: CnLabStatus.ERROR, byUser: 'Ada Lovelace' });
      expect(payload.serverTask.text).toEqual('Error during server configuration');
    });
  });

  describe('refreshStatus', () => {
    it('reports the layers after reconciling, and says it reconciled', async () => {
      const payload = payloadOf(
        await tool.refreshStatus({ spaceId: SPACE_ID, labId: LAB_ID }, undefined, requestOf())
      );

      expect(aggregate.refreshAndDescribeLabStart).toHaveBeenCalledWith(LAB_ID);
      expect(payload.refreshed).toBe(true);
      expect(payload.blockedAtLayer).toEqual('labManager');
    });

    it('does not report a healthy lab as blocked at a layer nobody read', async () => {
      // This tool cannot read the cloud and ssh layers — they need the lab owner role — so it
      // reports them as notProbed. If an unread layer counted as blocking, every lab answered
      // here, including one that is running perfectly, would come back blocked at `cloud`.
      aggregate.refreshAndDescribeLabStart.mockResolvedValue(resultOf(diagnosisOf(null, ['cloud', 'ssh'])));

      const payload = payloadOf(
        await tool.refreshStatus({ spaceId: SPACE_ID, labId: LAB_ID }, undefined, requestOf())
      );

      expect(payload.blockedAtLayer).toBeNull();
      expect(payload.notProbedLayers).toEqual(['cloud', 'ssh']);
      // But it is not a clean bill of health either, and the answer says so rather than
      // claiming every layer is fine.
      expect(payload.hypotheses[0].hypothesis).toContain('not read');
      expect(payload.hypotheses[0].nextTool).toEqual(CN_MCP_TOOL_LAB_DIAGNOSE_START);
    });

    it('carries no read-only hint, unlike every other tool here', () => {
      // It writes a reconciled status, and a lab whose server is ready has its containers
      // started as a consequence. A client that trusted a read-only hint would run it silently,
      // so the hint's absence is part of the contract and not an oversight to be tidied up.
      expect(toolMetadataOf('refreshStatus').annotations?.readOnlyHint).toBeUndefined();
      expect(toolMetadataOf('refreshStatus').description).toContain('NOT');
      // ...and it is the only one. Everything else here reads.
      for (const method of [
        'find',
        'diagnoseStart',
        'getStartErrors',
        'listContainers',
        'containerLogs',
        'statusTimeline',
      ]) {
        expect(toolMetadataOf(method).annotations?.readOnlyHint).toBe(true);
      }
    });
  });

  describe('every tool', () => {
    it('returns no credential the lab entity carries', async () => {
      // `find` is the only one of the seven that maps a lab entity into a payload; the other six
      // are handed DTOs and never see the entity, which is the actual guarantee. This sweep is
      // the net for the day one of them starts returning a lab, since the `@Exclude()`
      // decorators that protect the HTTP responses do nothing to `JSON.stringify`.
      aggregate.searchReachableInCurrentSpace.mockResolvedValue(ClPage.fromPagination(0, 20, 1, [makeLab()]));
      aggregate.getStartingError.mockResolvedValue({ mainErrors: [], logs: '' });
      aggregate.getAllLabContainers.mockResolvedValue({ containers: [], unreadableComposes: [] });
      aggregate.searchContainerLogs.mockResolvedValue({
        logs: '',
        totalLines: 0,
        matchedLines: 0,
        returnedLines: 0,
        truncated: false,
        filteredLocally: false,
      });
      aggregate.getLabStatusTimeline.mockResolvedValue({
        everStarted: false,
        history: [],
        serverTaskStatus: CnLabServerTaskStatus.NONE,
        serverTaskText: null,
        serverTaskDatetime: null,
      });

      const responses = await Promise.all([
        tool.find({ spaceId: SPACE_ID, limit: 20 }, undefined, requestOf()),
        tool.diagnoseStart({ spaceId: SPACE_ID, labId: LAB_ID }, undefined, requestOf()),
        tool.getStartErrors({ spaceId: SPACE_ID, labId: LAB_ID, maxLines: 200 }, undefined, requestOf()),
        tool.listContainers(
          { spaceId: SPACE_ID, labId: LAB_ID, onlyNotRunning: false },
          undefined,
          requestOf()
        ),
        tool.containerLogs(
          {
            spaceId: SPACE_ID,
            labId: LAB_ID,
            containerName: 'c',
            tail: 200,
            patternMode: 'substring',
            caseSensitive: false,
            contextLines: 0,
            errorsOnly: false,
          },
          undefined,
          requestOf()
        ),
        tool.statusTimeline({ spaceId: SPACE_ID, labId: LAB_ID, limit: 30 }, undefined, requestOf()),
        tool.refreshStatus({ spaceId: SPACE_ID, labId: LAB_ID }, undefined, requestOf()),
      ]);

      expect(responses).toHaveLength(7);
      for (const response of responses) {
        for (const secret of LAB_CREDENTIALS) {
          expect(response.content[0].text).not.toContain(secret);
        }
      }
    });
  });

  describe('audit', () => {
    it('writes one line per call, with the lab, Space, user and admin shortcut', async () => {
      await tool.diagnoseStart({ spaceId: SPACE_ID, labId: LAB_ID }, undefined, requestOf());

      expect(logged).toHaveLength(1);
      expect(logged[0]).toContain(`labId=${LAB_ID}`);
      expect(logged[0]).toContain(`spaceIdRequested=${SPACE_ID}`);
      expect(logged[0]).toContain('userId=user-1');
      expect(logged[0]).toContain('adminShortcut=false');
    });

    it('records that the platform admin shortcut applied', async () => {
      // A platform admin is the owner of every lab in every Space — the browser's behaviour,
      // kept on purpose, which is exactly why the line has to say when it was used.
      await tool.diagnoseStart(
        { spaceId: SPACE_ID, labId: LAB_ID },
        undefined,
        requestOf(makeUser(BlUserCategory.ADMIN))
      );

      expect(logged[0]).toContain('adminShortcut=true');
    });

    it('audits a call that is then refused on the lab, not only one that succeeds', async () => {
      aggregate.diagnoseLabStart.mockRejectedValue(new BlUnauthorizedException());
      aggregate.findByIdAndCheck.mockResolvedValue({ userRole: CnLabUserRole.USER });

      await tool
        .diagnoseStart({ spaceId: SPACE_ID, labId: LAB_ID }, undefined, requestOf())
        .catch(() => null);

      expect(logged).toHaveLength(1);
    });

    it('audits a call naming a Space this account cannot reach', async () => {
      // The line that matters most, and the one an audit written inside the authorized call
      // would miss entirely: a client reaching for a Space this account is not in leaves no other
      // trace. The Space logged is the one the call asked for, since there is no other.
      spaceService.findById.mockResolvedValue(null);

      await tool
        .diagnoseStart({ spaceId: 'someone-elses-space', labId: LAB_ID }, undefined, requestOf())
        .catch(() => null);

      expect(logged).toHaveLength(1);
      expect(logged[0]).toContain('spaceIdRequested=someone-elses-space');
      expect(logged[0]).toContain('userId=user-1');
      expect(aggregate.diagnoseLabStart).not.toHaveBeenCalled();
    });
  });
});
