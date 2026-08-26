import { lookup, Resolver } from 'node:dns/promises';

import { Injectable, Logger } from '@nestjs/common';
import { DateTime } from 'luxon';

import { CnExternalLabApiService } from '../../cn-external-lab-api/cn-external-lab-api.service';
import { CnLabManagerStatus } from '../../cn-external-lab-api/model/cn-lab-manager.class';
import { CnLabStatusDTO } from '../cn-lab.dto';
import { CnLab, CnLabWithSpace } from '../cn-lab.entity';
import { CnLabManagerService } from '../cn-lab-manager.service';
import { CnCloudProviderFactory } from '../server/cn-cloud-provider.factory';
import { CnCloudProviderService } from '../server/cn-cloud-provider.service';
import { CnCloudProviderOvhService } from '../server/ovh/cn-cloud-provider-ovh.service';
import { CnLabServerTaskStatus, CnLabStatus } from '../status/cn-lab-status.enum';
import {
  CN_LAB_START_LAYER_ORDER,
  cnBlockedAtLayer,
  CnLabStartDiagnosis,
  CnLabStartLayer,
  CnLabStartLayerName,
} from './cn-lab-start-diagnosis.dto';

/** Outcome of one probe, kept as a value so a rejection never escapes a layer. */
type CnProbeOutcome<T> =
  { ok: true; value: T } | { ok: false; error: unknown } | { ok: false; timedOut: true };

/**
 * Reads the six layers a cloud lab start crosses and says which one it is stuck at.
 *
 * Every probe is read-only. Nothing here refreshes a status, writes a status history row or
 * asks the lab manager to do anything: a tool named "diagnose" that starts bricks as a side
 * effect is worse than no tool. In particular this deliberately does not go through
 * `getStatus`, which force-refreshes a lab marked `SERVER_STOPPED` while glab answers, and a
 * refresh is what starts bricks through `CnLabListener`.
 *
 * It also never throws. The six layers run together, each under its own cap and all under a
 * global ceiling, and a layer that fails or runs out of budget reports `unknown` with a
 * reason. Letting one layer throw would throw away the diagnosis of the other five, which is
 * the opposite of the point: "ssh answers but the lab manager is dead" and "ssh does not
 * answer" are different diagnoses, and losing the distinction points the verdict at the
 * wrong layer.
 */
@Injectable()
export class CnLabStartDiagnosisService {
  private readonly logger = new Logger(CnLabStartDiagnosisService.name);

  /**
   * The whole diagnosis must come back inside this, because the caller is a conversation
   * waiting on a tool call. Each layer's own cap is clamped to it, so all six probes are
   * started together and none can outlive the ceiling.
   */
  public static readonly GLOBAL_CEILING_MS = 10_000;

  /**
   * Per-layer caps, in the order the layers are crossed.
   *
   * `spaceDb` has no entry because it has no cap: it is read off the lab row the caller already
   * loaded, so there is no I/O to time out. Typed to exclude it rather than given a zero, which
   * would be a cap that always expires waiting for a caller to reuse it by mistake.
   */
  private static readonly LAYER_CAP_MS: Record<Exclude<CnLabStartLayerName, 'spaceDb'>, number> = {
    cloud: 6_000,
    dns: 3_000,
    ssh: 8_000, // an ssh handshake is the slowest probe, and worth its budget
    labManager: 6_000,
    glab: 6_000,
  };

  /**
   * How long a server task may sit at `RUNNING` before it is read as stuck rather than as
   * a start in progress. Server tasks that complete take minutes; one that has been running
   * for half an hour has lost its runner.
   */
  private static readonly STUCK_SERVER_TASK_MINUTES = 30;

  /**
   * How long the glab layer waits for the lab manager's view of the lab before answering
   * without it. Short enough that the lab's own health check plus this stays inside the glab
   * cap, so a slow lab manager costs a detail rather than the layer.
   */
  private static readonly MANAGER_VIEW_CAP_MS = 3_000;

  constructor(
    private readonly labManagerService: CnLabManagerService,
    private readonly externalLabApiService: CnExternalLabApiService,
    private readonly cloudProviderFactory: CnCloudProviderFactory,
    private readonly ovhCloudProviderService: CnCloudProviderOvhService
  ) {}

  /**
   * Probe all six layers of a cloud lab.
   *
   * The lab manager status is fetched once and shared by the lab manager and glab probes:
   * two calls would double the slowest remote read for no extra information, and the two
   * layers are reading different parts of the same answer.
   */
  public async diagnose(lab: CnLabWithSpace): Promise<CnLabStartDiagnosis> {
    const managerStatus = this.settle(this.labManagerService.getLabStatus(lab));

    const [cloud, dns, ssh, labManager, glab] = await Promise.all([
      this.withCap('cloud', () => this.probeCloud(lab)),
      this.withCap('dns', () => this.probeDns(lab)),
      this.withCap('ssh', () => this.probeSsh(lab)),
      this.withCap('labManager', () => this.probeLabManager(lab, managerStatus)),
      this.withCap('glab', () => this.probeGlab(lab, managerStatus)),
    ]);

    return this.assemble({ spaceDb: this.probeSpaceDb(lab), cloud, dns, ssh, labManager, glab });
  }

  /**
   * The same six layers, read from a status the caller already reconciled.
   *
   * This is what `lab_refresh_status` reports. It reads the fields the browser shows any lab
   * member after a refresh, and marks as `notProbed` the two layers whose real probe reaches the
   * cloud provider and ssh — those are gated on the lab OWNER role, and answering them from a
   * member's call would hand out information the browser does not. Same shape, so a model does
   * not have to learn two verdict formats.
   *
   * `notProbed` and not `unknown`: an unread layer must not block, or every lab reported here —
   * including a perfectly healthy one — would come back blocked at the first layer this method
   * declines to read.
   *
   * Takes the status alone and not the lab: everything it can honestly say is in the reconciled
   * status, and a lab passed alongside it would only invite reading a field that was not
   * refreshed.
   */
  public describeFromStatus(status: CnLabStatusDTO): CnLabStartDiagnosis {
    const notProbed = (what: string): CnLabStartLayer => ({
      status: 'notProbed' as const,
      reason:
        `Nobody looked: reading ${what} needs the lab OWNER role, which a status refresh does ` +
        `not require. This layer is neither healthy nor broken here — the full six-layer ` +
        `diagnosis is what reads it.`,
    });

    const layers: Record<CnLabStartLayerName, CnLabStartLayer> = {
      spaceDb: this.spaceDbFrom(
        status.labStatus,
        status.serverTaskStatus,
        status.serverTaskText,
        status.serverTaskDatetime
      ),
      cloud:
        status.hasServerInstanceId && status.hasServerVolumeId
          ? notProbed('the instance and volume at the cloud provider')
          : {
              status: 'ko',
              reason:
                `The lab has ${status.hasServerInstanceId ? 'an' : 'no'} instance id and ` +
                `${status.hasServerVolumeId ? 'a' : 'no'} volume id recorded. ` +
                `Nothing can start until both exist.`,
            },
      dns: status.dnsConfigured
        ? {
            status: 'ok',
            reason: 'The lab is marked as having its DNS record configured.',
          }
        : {
            status: 'ko',
            reason: 'The lab is not marked as having its DNS record configured.',
          },
      ssh: notProbed('the ssh transport to the server'),
      labManager: status.labManagerIsRunning
        ? { status: 'ok', reason: 'The lab manager answers its health check.' }
        : { status: 'ko', reason: 'The lab manager does not answer its health check.' },
      glab: status.labIsRunning
        ? { status: 'ok', reason: 'The lab answers its health check.' }
        : { status: 'ko', reason: 'The lab does not answer its health check.' },
    };

    return this.assemble(layers);
  }

  private assemble(layers: Record<CnLabStartLayerName, CnLabStartLayer>): CnLabStartDiagnosis {
    return {
      layers,
      blockedAtLayer: cnBlockedAtLayer(layers),
      hasUnknownLayer: Object.values(layers).some((layer) => layer.status === 'unknown'),
      notProbedLayers: CN_LAB_START_LAYER_ORDER.filter((name) => layers[name].status === 'notProbed'),
    };
  }

  //////////////////////////////// LAYER 1 - SPACE DB ////////////////////////////////

  private probeSpaceDb(lab: CnLab): CnLabStartLayer {
    return this.spaceDbFrom(
      lab.currentStatus?.status,
      lab.serverTaskStatus,
      lab.serverTaskText,
      lab.serverTaskDatetime
    );
  }

  /**
   * What the lab row itself says, before anything remote is asked.
   *
   * `ok` here does not mean the lab is up: it means the row does not itself name a failure,
   * so the answer is further down. A status that is part of a start in progress
   * (`SERVER_STARTING`, `SERVER_RUNNING`, `SERVER_CONFIGURED`) is `ok` for exactly that
   * reason — the deeper layers are what say how far it got.
   */
  private spaceDbFrom(
    labStatus: CnLabStatus | undefined,
    serverTaskStatus: CnLabServerTaskStatus,
    serverTaskText: string | null | undefined,
    serverTaskDatetime: DateTime | null | undefined
  ): CnLabStartLayer {
    const details = this.spaceDbDetails(labStatus, serverTaskStatus, serverTaskText, serverTaskDatetime);

    if (labStatus === CnLabStatus.ERROR) {
      return {
        status: 'ko',
        reason: `The lab is in ERROR. Last server task text: ${serverTaskText ?? 'none recorded'}.`,
        details,
      };
    }

    if (serverTaskStatus === CnLabServerTaskStatus.ERROR) {
      return {
        status: 'ko',
        reason: `The last server task ended in ERROR: ${serverTaskText ?? 'no text recorded'}.`,
        details,
      };
    }

    if (serverTaskStatus === CnLabServerTaskStatus.RUNNING) {
      return this.spaceDbRunningTask(serverTaskText, serverTaskDatetime, details);
    }

    if (labStatus === CnLabStatus.NO_SERVER) {
      return {
        status: 'ko',
        reason: 'The lab has no server: nothing has been started yet.',
        details,
      };
    }

    if (labStatus === CnLabStatus.SERVER_STOPPED) {
      return {
        status: 'ko',
        reason: 'The server is stopped. It has to be started before any other layer can answer.',
        details,
      };
    }

    return {
      status: 'ok',
      reason: `The lab row records status ${labStatus ?? 'none'} and no failing server task.`,
      details,
    };
  }

  private spaceDbDetails(
    labStatus: CnLabStatus | undefined,
    serverTaskStatus: CnLabServerTaskStatus,
    serverTaskText: string | null | undefined,
    serverTaskDatetime: DateTime | null | undefined
  ): Record<string, unknown> {
    return {
      labStatus: labStatus ?? null,
      serverTaskStatus,
      serverTaskText: serverTaskText ?? null,
      serverTaskAt: serverTaskDatetime?.toISO() ?? null,
    };
  }

  /**
   * A server task still marked RUNNING: a start in progress, or a task whose runner is gone.
   *
   * A task with no start time is read as stuck rather than as young, because a task nobody
   * timed is one nothing will ever close.
   */
  private spaceDbRunningTask(
    serverTaskText: string | null | undefined,
    serverTaskDatetime: DateTime | null | undefined,
    details: Record<string, unknown>
  ): CnLabStartLayer {
    const runningForMinutes = serverTaskDatetime
      ? Math.round(DateTime.now().diff(serverTaskDatetime, 'minutes').minutes)
      : null;
    const isStuck =
      runningForMinutes == null || runningForMinutes >= CnLabStartDiagnosisService.STUCK_SERVER_TASK_MINUTES;

    return {
      status: isStuck ? 'ko' : 'ok',
      reason: isStuck
        ? `A server task has been RUNNING for ${runningForMinutes ?? 'an unknown number of'} ` +
          `minutes and is very likely stuck: "${serverTaskText ?? 'no text recorded'}". ` +
          `Nothing else will run on this lab while the task is held open.`
        : `A server task started ${runningForMinutes} minute(s) ago and is still running: ` +
          `"${serverTaskText ?? 'no text recorded'}". The start is in progress.`,
      details: { ...details, runningForMinutes },
    };
  }

  //////////////////////////////// LAYER 2 - CLOUD PROVIDER ////////////////////////////////

  /**
   * The instance, its volume and the volume's attachment, as the cloud provider sees them.
   *
   * Read here rather than through `CnLabServerService.getCompleteInfo`, which swallows a
   * provider error into a null: "the provider did not answer" would then be reported as
   * "the instance does not exist", which sends a reader off deleting and recreating a server
   * that is fine.
   */
  private async probeCloud(lab: CnLabWithSpace): Promise<CnLabStartLayer> {
    const details: Record<string, unknown> = {
      hasInstanceId: lab.serverInstanceId != null,
      hasVolumeId: lab.serverVolumeId != null,
      hasStaticIpId: lab.serverIpAddressId != null,
      region: lab.region?.technicalName ?? null,
    };

    if (lab.serverInstanceId == null) {
      return {
        status: 'ko',
        reason: 'No cloud instance id is recorded on the lab: the instance was never created.',
        details,
      };
    }
    if (lab.region == null) {
      return {
        status: 'ko',
        reason: 'The lab has no region, so no cloud provider call can be made for it.',
        details,
      };
    }

    const provider = await this.cloudProviderFactory.getCloudProviderServiceFromLab(lab.id);
    const region = lab.region.technicalName;

    const instance = await provider.getInstance(lab.serverInstanceId, region);
    details.instanceStatus = instance.status.status;
    details.instanceMessage = instance.status.message ?? null;

    if (instance.status.status !== 'RUNNING') {
      return {
        status: 'ko',
        reason:
          `The cloud instance is ${instance.status.status}, not RUNNING` +
          (instance.status.message ? `: ${instance.status.message}` : '.'),
        details,
      };
    }

    if (lab.serverVolumeId == null) {
      return {
        status: 'ko',
        reason: 'The instance runs but no volume id is recorded on the lab: the volume was never created.',
        details,
      };
    }

    return this.probeCloudStorage(
      provider,
      { region, instanceId: instance.id, volumeId: lab.serverVolumeId, staticIpId: lab.serverIpAddressId },
      details
    );
  }

  /**
   * The volume, its attachment and the static IP, once the instance is known to be running.
   *
   * Takes the ids rather than the lab, because {@link probeCloud} is where they are checked for
   * being recorded at all, and a second read off the lab here would lose that.
   */
  private async probeCloudStorage(
    provider: CnCloudProviderService,
    server: { region: string; instanceId: string; volumeId: string; staticIpId: string | null },
    details: Record<string, unknown>
  ): Promise<CnLabStartLayer> {
    const { region, instanceId, volumeId, staticIpId } = server;

    // In parallel: the volume, and the static IP for the providers that hold one separately
    // from the instance. Sequentially these would eat the layer's whole budget on a slow
    // provider, and the two are independent.
    const [volume, staticIp] = await Promise.all([
      provider.getVolume(volumeId, region),
      staticIpId == null ? Promise.resolve(undefined) : provider.getIpAddressFromId(staticIpId, region),
    ]);
    details.volumeStatus = volume?.status ?? null;
    details.staticIp = staticIp?.ipAddress ?? null;

    if (staticIp === null) {
      return {
        status: 'ko',
        reason:
          `Static IP ${staticIpId} is recorded on the lab but the provider does not ` +
          `know it. The lab's address is reserved separately from its instance here, so nothing ` +
          `reaches the server until it exists.`,
        details,
      };
    }

    if (volume == null) {
      return {
        status: 'ko',
        reason: `Volume ${volumeId} is recorded on the lab but the provider does not know it.`,
        details,
      };
    }

    const attached = await provider.volumeIsAttachedToInstance(instanceId, volume.id, region);
    details.volumeIsAttached = attached;
    if (!attached) {
      return {
        status: 'ko',
        reason:
          `The volume exists (status ${volume.status}) but is not attached to the instance. ` +
          `Nothing on the lab's data disk is reachable until it is.`,
        details,
      };
    }

    return {
      status: 'ok',
      reason: 'The instance is RUNNING and its volume is attached.',
      details,
    };
  }

  //////////////////////////////// LAYER 3 - DNS ////////////////////////////////

  /**
   * The OVH record, and whether it has actually propagated.
   *
   * Both halves matter and fail differently: a missing record is a step of the start that
   * never ran, while a record that exists but does not resolve is propagation, which is
   * waiting rather than fixing. Two resolvers are consulted for the same reason the start
   * sequence consults two — a public one proves the record reached the world, the OS one is
   * what ssh will actually use.
   */
  private async probeDns(lab: CnLabWithSpace): Promise<CnLabStartLayer> {
    const host = `lab.${lab.virtualHost}`;
    const details: Record<string, unknown> = { host, dnsConfiguredFlag: lab.dnsConfigured };

    const record = await this.ovhCloudProviderService.getLabDomainHostRecord(
      lab.getMainDomain(),
      lab.getSubDomainName()
    );
    details.record = record ? { subDomain: record.subDomain, target: record.target } : null;

    if (record == null) {
      return {
        status: 'ko',
        reason: `No DNS record exists for ${host}: the record creation step of the start never ran.`,
        details,
      };
    }

    const [publicAddresses, osAddress] = await Promise.all([
      this.resolvePublicly(host),
      this.resolveWithOs(host),
    ]);
    details.publicResolution = publicAddresses;
    details.osResolution = osAddress;

    if (publicAddresses == null || publicAddresses.length === 0) {
      return {
        status: 'ko',
        reason:
          `The DNS record for ${host} exists and points at ${record.target}, but public resolvers ` +
          `do not answer for it yet. This is propagation: it resolves itself with time.`,
        details,
      };
    }

    if (!publicAddresses.includes(record.target)) {
      return {
        status: 'ko',
        reason:
          `${host} resolves to ${publicAddresses.join(', ')} but the record targets ${record.target}. ` +
          `A stale record is being served.`,
        details,
      };
    }

    if (osAddress == null) {
      return {
        status: 'ko',
        reason:
          `${host} resolves publicly to ${publicAddresses.join(', ')} but not through this server's ` +
          `own resolver, which is the one ssh uses — a cached negative answer.`,
        details,
      };
    }

    return {
      status: 'ok',
      reason: `${host} resolves to ${osAddress}, matching the DNS record.`,
      details,
    };
  }

  private async resolvePublicly(host: string): Promise<string[] | null> {
    const resolver = new Resolver({ timeout: 2000, tries: 1 });
    resolver.setServers(['8.8.8.8', '1.1.1.1']);
    return resolver.resolve4(host).catch(() => null);
  }

  private async resolveWithOs(host: string): Promise<string | null> {
    return lookup(host, { family: 4 })
      .then(({ address }) => address)
      .catch(() => null);
  }

  //////////////////////////////// LAYER 4 - SSH / OS ////////////////////////////////

  /**
   * Whether the server accepts an ssh connection at all.
   *
   * A reachability probe and nothing more: it runs no command on the server. Running
   * diagnostics over ssh is a separate, whitelisted surface, and putting it here would turn
   * a read-only diagnosis into remote execution.
   *
   * Connects by IP where one can be resolved, which is what the bootstrap does, so a DNS
   * problem shows up as a DNS problem in the layer above and not twice.
   */
  private async probeSsh(lab: CnLabWithSpace): Promise<CnLabStartLayer> {
    const sshService = await this.cloudProviderFactory.getSshLabServiceByIp(lab);
    const connected = await sshService.checkSshConnection();

    return connected
      ? { status: 'ok', reason: 'The server accepts an ssh connection.' }
      : {
          status: 'ko',
          reason:
            'The server does not accept an ssh connection. Either it has not finished booting, ' +
            'sshd is down, or the network path to it is closed.',
        };
  }

  //////////////////////////////// LAYER 5 - LAB MANAGER ////////////////////////////////

  /**
   * The lab manager: reachable, initialized, configured.
   *
   * A version behind the recommended one is reported but is not by itself a failure — labs
   * run for months on an older lab manager. Calling it `ko` would point `blockedAtLayer` at
   * this layer on every lab that is merely due an upgrade, and hide the layer that is
   * actually down.
   */
  private async probeLabManager(
    lab: CnLab,
    statusOutcome: Promise<CnProbeOutcome<CnLabManagerStatus>>
  ): Promise<CnLabStartLayer> {
    const outcome = await statusOutcome;
    if (!outcome.ok) {
      return {
        status: 'ko',
        reason:
          `The lab manager cannot be read: ${this.errorText(outcome)}. ` +
          `Either it is not running, or the server never got as far as starting it.`,
      };
    }

    const status = outcome.value;
    const recommendedVersion = this.labManagerService.getLabManagerRecommendedVersion();
    const details: Record<string, unknown> = {
      version: status.version,
      recommendedVersion,
      isInitialized: status.isInitialized,
      isConfigured: status.isConfigured,
      lastInitVersion: status.lastInitVersion,
      currentTask: status.currentTask ?? null,
    };

    if (!status.isInitialized) {
      return {
        status: 'ko',
        reason: 'The lab manager answers but has never been initialized.',
        details,
      };
    }
    if (!status.isConfigured) {
      return {
        status: 'ko',
        reason: 'The lab manager answers and is initialized, but is not configured.',
        details,
      };
    }

    return {
      status: 'ok',
      reason:
        `The lab manager answers, is initialized and configured, on version ${status.version}` +
        (status.version === recommendedVersion ? '.' : ` (recommended: ${recommendedVersion}).`),
      details,
    };
  }

  //////////////////////////////// LAYER 6 - GLAB ////////////////////////////////

  /**
   * The lab itself, behind the lab manager.
   *
   * Its own health check is asked directly, because a lab manager that is down says nothing
   * about a lab that is up — that happens after a lab manager restart. The lab manager's view
   * of the lab is added when it is available, since `hasStartError` and `startProgress` are
   * only there.
   */
  private async probeGlab(
    lab: CnLab,
    statusOutcome: Promise<CnProbeOutcome<CnLabManagerStatus>>
  ): Promise<CnLabStartLayer> {
    const isRunning = await this.externalLabApiService.healthCheck(lab.getGlabSpaceApiInfo());

    // The lab manager's view of the lab enriches this layer but must not gate it: reading the
    // lab manager's status is the slowest call in the whole diagnosis, and the lab has already
    // answered for itself. Waited for briefly, then done without — otherwise a slow lab manager
    // costs us the one layer that could still be read.
    const managerView = await this.ifPrompt(statusOutcome, CnLabStartDiagnosisService.MANAGER_VIEW_CAP_MS);
    const details = this.glabDetails(isRunning, managerView);

    if (managerView?.glabStatus?.hasStartError === true || managerView?.labStatus === 'ERROR') {
      return {
        status: 'ko',
        reason:
          `The lab manager reports the lab failed to start (labStatus ${managerView.labStatus}). ` +
          `Its start error log is the next thing to read.`,
        details,
      };
    }

    if (isRunning) {
      return { status: 'ok', reason: 'The lab answers its health check.', details };
    }

    if (managerView?.labStatus === 'STARTING') {
      return this.glabStarting(managerView, details);
    }

    return {
      status: 'ko',
      reason: 'The lab does not answer its health check and the lab manager does not report it starting.',
      details,
    };
  }

  private glabDetails(isRunning: boolean, managerView: CnLabManagerStatus | null): Record<string, unknown> {
    const glabStatus = managerView?.glabStatus;

    return {
      answersHealthCheck: isRunning,
      labStatus: managerView?.labStatus ?? null,
      glabStatus: glabStatus?.status ?? null,
      hasStartError: glabStatus?.hasStartError ?? null,
      startProgress: glabStatus?.startProgress ?? null,
    };
  }

  private glabStarting(managerView: CnLabManagerStatus, details: Record<string, unknown>): CnLabStartLayer {
    return {
      status: 'ko',
      reason:
        `The lab is still STARTING` +
        (managerView.glabStatus?.startProgress
          ? ` at ${managerView.glabStatus.startProgress.percent}%: ` +
            `${managerView.glabStatus.startProgress.message}.`
          : '.'),
      details,
    };
  }

  //////////////////////////////// PROBE PLUMBING ////////////////////////////////

  /**
   * The value of an already-settling probe if it arrives inside `capMs`, or null.
   *
   * For a value that improves an answer without being needed to give one. Distinct from
   * {@link withCap}, which decides a layer's verdict: here "it did not arrive" is not a verdict,
   * it is one detail missing from someone else's.
   */
  private async ifPrompt<T>(settled: Promise<CnProbeOutcome<T>>, capMs: number): Promise<T | null> {
    const outcome = await this.orAfter(settled, capMs, null);
    return outcome != null && outcome.ok ? outcome.value : null;
  }

  /**
   * Whichever comes first: the promise, or `late` once `capMs` has passed.
   *
   * The timer is always cleared, because the losing side of the race is still in flight and its
   * timer would otherwise hold the event loop open for the rest of its budget — on every layer
   * of every call.
   */
  private async orAfter<T, L>(promise: Promise<T>, capMs: number, late: L): Promise<T | L> {
    let timer: NodeJS.Timeout | undefined;
    const afterCap = new Promise<L>((resolve) => {
      timer = setTimeout(() => resolve(late), capMs);
    });

    try {
      return await Promise.race([promise, afterCap]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  /**
   * Turn a promise into one that always resolves, carrying the failure as a value.
   *
   * Needed because one promise is awaited by two layers under two different caps: left as a
   * rejecting promise it would be an unhandled rejection the moment the first layer times out
   * before attaching its handler.
   */
  private settle<T>(promise: Promise<T>): Promise<CnProbeOutcome<T>> {
    return promise.then(
      (value) => ({ ok: true as const, value }),
      (error: unknown) => ({ ok: false as const, error })
    );
  }

  /**
   * Run one probe under its cap, and never let it fail the diagnosis.
   *
   * A probe that throws or runs out of budget becomes `unknown` with a reason saying which
   * of the two happened, because they lead to different next steps: a timeout is worth
   * retrying, an error usually is not.
   */
  private async withCap(
    layer: Exclude<CnLabStartLayerName, 'spaceDb'>,
    probe: () => Promise<CnLabStartLayer>
  ): Promise<CnLabStartLayer> {
    const capMs = Math.min(
      CnLabStartDiagnosisService.LAYER_CAP_MS[layer],
      CnLabStartDiagnosisService.GLOBAL_CEILING_MS
    );

    const outOfBudget: CnProbeOutcome<CnLabStartLayer> = { ok: false, timedOut: true };
    const outcome = await this.orAfter(this.settle(probe()), capMs, outOfBudget);

    if (outcome.ok) {
      return outcome.value;
    }

    if ('timedOut' in outcome) {
      return {
        status: 'unknown',
        reason:
          `This layer did not answer within ${capMs}ms, so nothing is known about it. ` +
          `It is reported as unknown rather than guessed at; a retry may well answer.`,
      };
    }

    this.logger.warn(`Lab start diagnosis: layer ${layer} failed: ${this.errorText(outcome)}`);
    return {
      status: 'unknown',
      reason: `This layer could not be read: ${this.errorText(outcome)}.`,
    };
  }

  private errorText(outcome: CnProbeOutcome<unknown>): string {
    if (outcome.ok || 'timedOut' in outcome) {
      return 'no error';
    }
    const error = outcome.error;
    return error instanceof Error ? error.message : String(error);
  }
}
