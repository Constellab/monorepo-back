import { DateTime } from 'luxon';

import { CnCloudProviderRegion } from '../../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import { CnExternalLabApiService } from '../../cn-external-lab-api/cn-external-lab-api.service';
import { CnLabManagerStatus } from '../../cn-external-lab-api/model/cn-lab-manager.class';
import { CnLabStatusDTO } from '../cn-lab.dto';
import { CnLabEntity, CnLabType, CnLabWithSpace } from '../cn-lab.entity';
import { CnLabManagerService } from '../cn-lab-manager.service';
import { CnCloudProviderFactory } from '../server/cn-cloud-provider.factory';
import { CnCloudProviderOvhService } from '../server/ovh/cn-cloud-provider-ovh.service';
import { CnLabServerTaskStatus, CnLabStatus } from '../status/cn-lab-status.enum';
import { CnLabStatusHistory } from '../status/cn-lab-status-history.entity';
import { CnLabStartDiagnosisService } from './cn-lab-start-diagnosis.service';

// The DNS layer is the one probe with no injectable collaborator: it resolves names itself,
// because that is the only way to tell a record that exists from a record that has actually
// propagated. Mocked at the module boundary for the same reason.
const mockResolve4 = jest.fn();
const mockOsLookup = jest.fn();
jest.mock('node:dns/promises', () => ({
  lookup: (...args: unknown[]) => mockOsLookup(...args),
  Resolver: class {
    setServers(): void {
      // the probe pins public resolvers; irrelevant to a mocked resolution
    }
    resolve4(host: string): Promise<string[]> {
      return mockResolve4(host) as Promise<string[]>;
    }
  },
}));

/**
 * The six layers a cloud lab start crosses, and the two properties the whole diagnosis rests
 * on: it answers even when a layer does not, and the layer it blames is the *first* one that
 * failed. A verdict that points at the lab manager because the volume was never attached sends
 * whoever reads it to the wrong place, which is worse than no verdict.
 */
describe('CnLabStartDiagnosisService', () => {
  const RECOMMENDED_VERSION = '2.13.0';
  const SERVER_IP = '1.2.3.4';

  let labManagerService: { getLabStatus: jest.Mock; getLabManagerRecommendedVersion: jest.Mock };
  let externalLabApiService: { healthCheck: jest.Mock };
  let cloudProvider: { getInstance: jest.Mock; getVolume: jest.Mock; volumeIsAttachedToInstance: jest.Mock };
  let sshService: { checkSshConnection: jest.Mock };
  let cloudProviderFactory: { getCloudProviderServiceFromLab: jest.Mock; getSshLabServiceByIp: jest.Mock };
  let ovhService: { getLabDomainHostRecord: jest.Mock };
  let service: CnLabStartDiagnosisService;

  beforeEach(() => {
    // Every collaborator starts on the happy path, so each test breaks exactly one layer and
    // the expectation is about that layer rather than about the fixture.
    labManagerService = {
      getLabStatus: jest.fn().mockResolvedValue(healthyManagerStatus()),
      getLabManagerRecommendedVersion: jest.fn().mockReturnValue(RECOMMENDED_VERSION),
    };
    externalLabApiService = { healthCheck: jest.fn().mockResolvedValue(true) };
    cloudProvider = {
      getInstance: jest.fn().mockResolvedValue({ id: 'instance-1', status: { status: 'RUNNING' } }),
      getVolume: jest.fn().mockResolvedValue({ id: 'volume-1', status: 'IN_USE' }),
      volumeIsAttachedToInstance: jest.fn().mockResolvedValue(true),
    };
    sshService = { checkSshConnection: jest.fn().mockResolvedValue(true) };
    cloudProviderFactory = {
      getCloudProviderServiceFromLab: jest.fn().mockResolvedValue(cloudProvider),
      getSshLabServiceByIp: jest.fn().mockResolvedValue(sshService),
    };
    ovhService = {
      getLabDomainHostRecord: jest.fn().mockResolvedValue({ subDomain: '*.rio', target: SERVER_IP }),
    };
    mockResolve4.mockResolvedValue([SERVER_IP]);
    mockOsLookup.mockResolvedValue({ address: SERVER_IP });

    service = new CnLabStartDiagnosisService(
      labManagerService as unknown as CnLabManagerService,
      externalLabApiService as unknown as CnExternalLabApiService,
      cloudProviderFactory as unknown as CnCloudProviderFactory,
      ovhService as unknown as CnCloudProviderOvhService
    );
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  function healthyManagerStatus(): CnLabManagerStatus {
    return {
      version: RECOMMENDED_VERSION,
      isInitialized: true,
      isConfigured: true,
      lastInitVersion: RECOMMENDED_VERSION,
      labFrontUrl: 'https://lab.rio.gencovery.io',
      labStatus: 'RUNNING',
      adminerIsRunning: false,
      containersStatus: {},
      glabStatus: { status: 'running', hasStartError: false },
    };
  }

  /**
   * A real entity, not a literal: the probes call `isCloud`, `getMainDomain`,
   * `getLabManagerApiInfo` and friends, and a fixture that stubs those would stop testing the
   * lab the rest of the application passes around.
   */
  function makeLab(overrides: Partial<CnLabEntity> = {}): CnLabWithSpace {
    const lab = new CnLabEntity();
    lab.id = 'lab-1';
    lab.name = 'rio';
    lab.type = CnLabType.CLOUD;
    lab.virtualHost = 'rio.gencovery.io';
    lab.serverInstanceId = 'instance-1';
    lab.serverVolumeId = 'volume-1';
    lab.serverIpAddressId = null;
    lab.dnsConfigured = true;
    lab.serverTaskStatus = CnLabServerTaskStatus.SUCCESS;
    lab.serverTaskText = null;
    lab.serverTaskDatetime = null;
    lab.currentStatus = { status: CnLabStatus.LAB_RUNNING } as CnLabStatusHistory;
    lab.region = { technicalName: 'GRA11' } as CnCloudProviderRegion;
    // The credentials the entity carries, given values a test can look for.
    lab.glabProdApiKey = 'PROD-API-KEY';
    lab.glabDevApiKey = 'DEV-API-KEY';
    lab.labManagerApiKey = 'LAB-MANAGER-KEY';
    lab.codelabToken = 'CODELAB-TOKEN';
    lab.gwsCoreProdDbPassword = 'PROD-DB-PASSWORD';
    lab.gwsCoreDevDbPassword = 'DEV-DB-PASSWORD';

    Object.assign(lab, overrides);
    return lab;
  }

  describe('diagnose', () => {
    it('reports all six layers, and every one of them on a healthy lab', async () => {
      const diagnosis = await service.diagnose(makeLab());

      expect(Object.keys(diagnosis.layers).sort()).toEqual(
        ['cloud', 'dns', 'glab', 'labManager', 'spaceDb', 'ssh'].sort()
      );
      expect(Object.values(diagnosis.layers).map((layer) => layer.status)).toEqual([
        'ok',
        'ok',
        'ok',
        'ok',
        'ok',
        'ok',
      ]);
      expect(diagnosis.blockedAtLayer).toBeNull();
      expect(diagnosis.hasUnknownLayer).toBe(false);
      // Every layer says why, including the ones that passed: a reason is what tells a reader
      // the probe ran at all.
      for (const layer of Object.values(diagnosis.layers)) {
        expect(layer.reason.length).toBeGreaterThan(0);
      }
    });

    it('blames the first failing layer, not the last, when several are down', async () => {
      // The volume is not attached, so nothing above the cloud layer can possibly work — and
      // indeed nothing above it does. The verdict has to name the cause, not the symptom.
      cloudProvider.volumeIsAttachedToInstance.mockResolvedValue(false);
      sshService.checkSshConnection.mockResolvedValue(false);
      labManagerService.getLabStatus.mockRejectedValue(new Error('The lab manager is not running'));
      externalLabApiService.healthCheck.mockResolvedValue(false);

      const diagnosis = await service.diagnose(makeLab());

      expect(diagnosis.blockedAtLayer).toEqual('cloud');
      expect(diagnosis.layers.cloud.reason).toContain('not attached');
      expect(diagnosis.layers.ssh.status).toEqual('ko');
      expect(diagnosis.layers.labManager.status).toEqual('ko');
    });

    it('separates "ssh answers but the lab manager is dead" from "ssh does not answer"', async () => {
      labManagerService.getLabStatus.mockRejectedValue(new Error('The lab manager is not running'));
      externalLabApiService.healthCheck.mockResolvedValue(false);

      const diagnosis = await service.diagnose(makeLab());

      // Losing this distinction is what would point the verdict at the wrong layer: the server
      // is fine, the software on it is not.
      expect(diagnosis.layers.ssh.status).toEqual('ok');
      expect(diagnosis.blockedAtLayer).toEqual('labManager');
    });

    it('still answers for the other five layers when one hangs past its cap', async () => {
      jest.useFakeTimers();
      // A cloud provider that never answers: the case a naive implementation turns into a tool
      // call that never returns, or into five layers thrown away with one exception.
      cloudProvider.getInstance.mockReturnValue(new Promise(() => undefined));

      const pending = service.diagnose(makeLab());
      await jest.advanceTimersByTimeAsync(CnLabStartDiagnosisService.GLOBAL_CEILING_MS);
      const diagnosis = await pending;

      expect(diagnosis.layers.cloud.status).toEqual('unknown');
      expect(diagnosis.layers.cloud.reason).toContain('did not answer');
      expect(diagnosis.hasUnknownLayer).toBe(true);
      // Unknown counts as blocked: a layer nobody could read is not one to look past.
      expect(diagnosis.blockedAtLayer).toEqual('cloud');
      expect(diagnosis.layers.dns.status).toEqual('ok');
      expect(diagnosis.layers.labManager.status).toEqual('ok');
    });

    it('never throws, whatever every layer does', async () => {
      cloudProviderFactory.getCloudProviderServiceFromLab.mockRejectedValue(new Error('provider down'));
      cloudProviderFactory.getSshLabServiceByIp.mockRejectedValue(new Error('no ssh key'));
      ovhService.getLabDomainHostRecord.mockRejectedValue(new Error('OVH down'));
      labManagerService.getLabStatus.mockRejectedValue(new Error('unreachable'));
      externalLabApiService.healthCheck.mockRejectedValue(new Error('unreachable'));

      const diagnosis = await service.diagnose(makeLab());

      expect(diagnosis.layers.cloud.status).toEqual('unknown');
      expect(diagnosis.layers.dns.status).toEqual('unknown');
      expect(diagnosis.layers.ssh.status).toEqual('unknown');
      // A failure that is the layer's own answer stays a failure; only an unreadable layer is
      // unknown. The lab manager not answering *is* the lab manager layer's verdict.
      expect(diagnosis.layers.labManager.status).toEqual('ko');
      expect(diagnosis.blockedAtLayer).toEqual('cloud');
    });

    it('tells a start in progress from a server task that has lost its runner', async () => {
      const inProgress = await service.diagnose(
        makeLab({
          serverTaskStatus: CnLabServerTaskStatus.RUNNING,
          serverTaskText: 'Configuring the server',
          serverTaskDatetime: DateTime.now().minus({ minutes: 2 }),
        })
      );
      expect(inProgress.layers.spaceDb.status).toEqual('ok');
      expect(inProgress.layers.spaceDb.reason).toContain('in progress');

      const stuck = await service.diagnose(
        makeLab({
          serverTaskStatus: CnLabServerTaskStatus.RUNNING,
          serverTaskText: 'Configuring the server',
          serverTaskDatetime: DateTime.now().minus({ hours: 4 }),
        })
      );
      expect(stuck.layers.spaceDb.status).toEqual('ko');
      expect(stuck.blockedAtLayer).toEqual('spaceDb');
      expect(stuck.layers.spaceDb.reason).toContain('stuck');
    });

    it('reads each remote system once and asks none of them to do anything', async () => {
      await service.diagnose(makeLab());

      // The whole call set of a diagnosis, enumerated: four health-and-status reads and one ssh
      // handshake. Nothing here refreshes a status — the space API's refresh writes a status
      // row, and a status change to SERVER_CONFIGURED makes the lab's bricks start, so a tool
      // named "diagnose" that went through it would start containers. That this service is
      // given nothing which can write is the structural half of the guarantee; the tool spec
      // asserts the other half, that the tool does not reach a mutating aggregate method.
      expect(labManagerService.getLabStatus).toHaveBeenCalledTimes(1);
      expect(externalLabApiService.healthCheck).toHaveBeenCalledTimes(1);
      expect(cloudProvider.getInstance).toHaveBeenCalledTimes(1);
      expect(cloudProvider.getVolume).toHaveBeenCalledTimes(1);
      expect(sshService.checkSshConnection).toHaveBeenCalledTimes(1);
    });

    it('reports a lab manager behind the recommended version without blaming it', async () => {
      labManagerService.getLabStatus.mockResolvedValue({ ...healthyManagerStatus(), version: '2.9.0' });

      const diagnosis = await service.diagnose(makeLab());

      // Labs run for months on an older lab manager. Calling that `ko` would point the verdict
      // at this layer on every lab merely due an upgrade, and hide the one that is down.
      expect(diagnosis.layers.labManager.status).toEqual('ok');
      expect(diagnosis.layers.labManager.details).toMatchObject({
        version: '2.9.0',
        recommendedVersion: RECOMMENDED_VERSION,
      });
    });

    it('tells a missing DNS record from one that has not propagated', async () => {
      ovhService.getLabDomainHostRecord.mockResolvedValue(null);
      const missing = await service.diagnose(makeLab());
      expect(missing.layers.dns.status).toEqual('ko');
      expect(missing.layers.dns.reason).toContain('No DNS record');

      ovhService.getLabDomainHostRecord.mockResolvedValue({ subDomain: '*.rio', target: SERVER_IP });
      mockResolve4.mockRejectedValue(new Error('NXDOMAIN'));
      const notPropagated = await service.diagnose(makeLab());
      expect(notPropagated.layers.dns.status).toEqual('ko');
      // Two different fixes: one is waiting, the other is running the missing step.
      expect(notPropagated.layers.dns.reason).toContain('propagation');
    });

    it('keeps every credential the lab entity carries out of the verdict', async () => {
      cloudProvider.volumeIsAttachedToInstance.mockResolvedValue(false);
      labManagerService.getLabStatus.mockRejectedValue(new Error('The lab manager is not running'));

      const diagnosis = await service.diagnose(makeLab());
      const serialized = JSON.stringify(diagnosis);

      // The @Exclude() decorators that keep these out of an HTTP response are
      // class-transformer's and do nothing here. The only defence is that no part of the lab
      // entity is ever copied wholesale into a verdict.
      for (const secret of [
        'PROD-API-KEY',
        'DEV-API-KEY',
        'LAB-MANAGER-KEY',
        'CODELAB-TOKEN',
        'PROD-DB-PASSWORD',
        'DEV-DB-PASSWORD',
      ]) {
        expect(serialized).not.toContain(secret);
      }
    });
  });

  describe('describeFromStatus', () => {
    function statusOf(overrides: Partial<CnLabStatusDTO> = {}): CnLabStatusDTO {
      return {
        labStatus: CnLabStatus.LAB_RUNNING,
        labManagerIsRunning: true,
        labIsRunning: true,
        hasServerInstanceId: true,
        hasServerVolumeId: true,
        dnsConfigured: true,
        serverTaskStatus: CnLabServerTaskStatus.SUCCESS,
        serverTaskText: null,
        serverTaskDatetime: null,
        ...overrides,
      };
    }

    it('reports the same six layers, so one verdict format serves both tools', () => {
      const diagnosis = service.describeFromStatus(statusOf());

      expect(Object.keys(diagnosis.layers).sort()).toEqual(
        ['cloud', 'dns', 'glab', 'labManager', 'spaceDb', 'ssh'].sort()
      );
    });

    it('marks the owner-only layers unknown rather than guessing them', () => {
      const diagnosis = service.describeFromStatus(statusOf());

      // A refresh is authorized for any member of the lab, while the provider and ssh probes
      // are gated on the lab owner. Answering them here would hand a member information the
      // browser does not give them.
      expect(diagnosis.layers.ssh.status).toEqual('unknown');
      expect(diagnosis.layers.ssh.reason).toContain('OWNER');
      expect(diagnosis.layers.cloud.status).toEqual('unknown');
      expect(diagnosis.hasUnknownLayer).toBe(true);
    });

    it('still reports what the refreshed status does say', () => {
      const diagnosis = service.describeFromStatus(
        statusOf({ hasServerVolumeId: false, labManagerIsRunning: false, labIsRunning: false })
      );

      // A volume that was never created is knowable without asking the provider, so it is
      // answered rather than deferred.
      expect(diagnosis.layers.cloud.status).toEqual('ko');
      expect(diagnosis.blockedAtLayer).toEqual('cloud');
      expect(diagnosis.layers.labManager.status).toEqual('ko');
      expect(diagnosis.layers.glab.status).toEqual('ko');
    });
  });
});
