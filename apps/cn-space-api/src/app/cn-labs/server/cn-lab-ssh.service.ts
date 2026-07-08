import { lookup, Resolver } from 'node:dns/promises';

import { BlBadRequestException } from '@monorepo/back-core-lib';
import { Logger } from '@nestjs/common';

import {
  CnCommandService,
  CnExecCommandMode,
  CnExecOptions,
} from '../../cn-core/services/cn-command.service';

/**
 * Options to retry a transient ssh failure (e.g. DNS not yet propagated,
 * connection refused while sshd is still starting).
 */
export interface CnSshRetryOptions {
  /** number of attempts (including the first). default 1 (no retry) */
  attempts?: number;
  /** delay in ms before the first retry. default 5000 */
  initialDelayMs?: number;
  /** multiplier applied to the delay after each attempt. default 2 */
  backoffFactor?: number;
  /** max delay between attempts in ms. default 30000 */
  maxDelayMs?: number;
}

/**
 * Service to execute ssh command to the lab server
 */
export class CnLabSshService {
  public static readonly LAB_CONFIGURER_FOLDER = 'lab-configurer';

  /**
   * Patterns of transient ssh/network failures that are worth retrying.
   * These are failures where the server/DNS is not ready yet, not failures
   * of the remote command itself.
   */
  private static readonly TRANSIENT_ERROR_PATTERNS: RegExp[] = [
    /could not resolve hostname/i,
    /name or service not known/i,
    /temporary failure in name resolution/i,
    /connection refused/i,
    /connection timed out/i,
    /connection reset/i,
    /connection closed/i,
    /operation timed out/i,
    /no route to host/i,
    /network is unreachable/i,
    /timeout, server .* not responding/i,
    /kex_exchange_identification/i,
  ];

  private readonly logger = new Logger(CnLabSshService.name);

  constructor(
    private readonly commandService: CnCommandService,
    private readonly isLocal: boolean,
    private readonly sshUserName: string,
    private readonly labVirtualHost: string,
    private readonly labId: string,
    private readonly sshKeyFilePath: string,
    /**
     * Optional IP address of the server. When provided, ssh connects directly
     * to this IP instead of relying on DNS resolution of the virtual host.
     * This removes DNS propagation from the critical path of server bootstrap.
     */
    private readonly sshHost?: string
  ) {}

  public execSshCommand(
    commands: string[],
    options?: CnExecOptions,
    logCommand: boolean = true,
    retry?: CnSshRetryOptions
  ): Promise<string> {
    const command = this.getSshCommand(commands);
    if (logCommand) {
      this.logger.log(`Executing command -- ${command} -- for lab ${this.labId}`);
    }
    return this.execWithRetry(command, options, retry);
  }

  /**
   * Execute a command, retrying only on transient (network/DNS) failures.
   * Genuine command errors (non-transient) fail fast on the first attempt.
   */
  private async execWithRetry(
    command: string,
    options?: CnExecOptions,
    retry?: CnSshRetryOptions
  ): Promise<string> {
    const attempts = retry?.attempts ?? 1;
    const backoffFactor = retry?.backoffFactor ?? 2;
    const maxDelayMs = retry?.maxDelayMs ?? 30000;
    let delayMs = retry?.initialDelayMs ?? 5000;

    let lastError: unknown;
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        return await this.commandService.execCommand(command, options);
      } catch (e) {
        lastError = e;

        const isLastAttempt = attempt >= attempts;
        if (isLastAttempt || !CnLabSshService.isTransientError(e)) {
          throw e;
        }

        this.logger.warn(
          `Transient ssh failure for lab ${this.labId} (attempt ${attempt} of ${attempts}). ` +
            `Retrying in ${delayMs}ms. Error: ${CnLabSshService.errorToString(e)}`
        );
        await new Promise((r) => setTimeout(r, delayMs));
        delayMs = Math.min(delayMs * backoffFactor, maxDelayMs);
      }
    }

    // unreachable, but keeps the type checker happy
    throw lastError;
  }

  /**
   * Determine whether an error is a transient network/DNS failure worth retrying.
   */
  public static isTransientError(error: unknown): boolean {
    const message = CnLabSshService.errorToString(error).toLowerCase();
    return CnLabSshService.TRANSIENT_ERROR_PATTERNS.some((pattern) => pattern.test(message));
  }

  private static errorToString(error: unknown): string {
    if (error == null) {
      return '';
    }
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  /**
   * The host ssh actually connects to: the server IP when known, otherwise the
   * DNS name of the lab virtual host.
   */
  private getConnectHost(): string {
    return this.sshHost ?? `lab.${this.labVirtualHost}`;
  }

  /**
   * Human-readable description of the ssh transport, for logging. Makes it
   * explicit whether a connection uses the IP or the domain.
   */
  private getConnectionDescription(): string {
    return this.sshHost
      ? `IP ${this.sshHost} (host ${`lab.${this.labVirtualHost}`})`
      : `domain lab.${this.labVirtualHost}`;
  }

  private getSshCommand(commands: string[], options: string[] = []): string {
    // in pre-prod and prod env, set the path to the ssh key
    if (this.isLocal) {
      this.logger.debug('Running ssh command locally.');
    } else {
      this.logger.debug(`Running ssh command with rsa file : ${this.sshKeyFilePath}.`);
      options.push(`-i ${this.sshKeyFilePath}`);
    }

    // When we know the server IP, connect directly to it instead of the DNS
    // name so that DNS propagation is not on the critical path. We keep a
    // stable host-key alias on the virtual host so known_hosts stays consistent
    // whether we connect by IP or by name.
    if (this.sshHost) {
      options.push(`-o HostKeyAlias=lab.${this.labVirtualHost}`);
    }

    return (
      `ssh ${options.join(' ')} -o StrictHostKeyChecking=no ` +
      `${this.sshUserName}@${this.getConnectHost()} "${commands.join(';')}"`
    );
  }

  /**
   * Wait for the server to come back after a `sudo reboot`.
   *
   * `sudo reboot` returns immediately but sshd stays up for a few seconds while
   * the OS tears down. Probing right away can connect to the *pre-reboot* sshd
   * and wrongly conclude the server is ready. We first wait a fixed delay to let
   * the reboot actually drop sshd, then wait for a single successful connection.
   * This makes the reboot guard explicit instead of relying on a
   * consecutive-success counter to accidentally bridge the teardown window.
   */
  public async waitForServerReboot(): Promise<void> {
    const rebootTeardownDelay = 20000;
    this.logger.log(`Waiting ${rebootTeardownDelay}ms for reboot to tear down sshd for lab ${this.labId}`);
    await new Promise((r) => setTimeout(r, rebootTeardownDelay));

    await this.waitForSshConnection(1);
  }

  /**
   * Call ssh regularly to check if the server is up.
   * Raise an exception if the server is not up after 15 * 20 seconds
   * @param consecutiveRequiredSuccess number of consecutive successful ssh
   * calls required to consider the server up and running
   * @private
   */
  public async waitForSshConnection(consecutiveRequiredSuccess: number = 1): Promise<void> {
    // wait for server to reboot
    let count = 0;
    let successCount = 0;
    const countLimit = 30;
    const waitTime = 15000;
    while (count < countLimit) {
      const result = await this.checkSshConnection();
      if (result) {
        successCount++;

        if (successCount >= consecutiveRequiredSuccess) {
          return;
        }
      } else {
        successCount = 0;
      }

      this.logger.log(
        `Waiting for server to be available using ${this.getConnectionDescription()} ` +
          `for lab ${this.labId}. ` +
          `Attempt ${count + 1} of ${countLimit}. Success ${successCount} of ${consecutiveRequiredSuccess}`
      );
      // wait 15 seconds
      await new Promise((r) => setTimeout(r, waitTime));
      count++;
    }

    throw new BlBadRequestException(`Server is not available for lab ${this.labId}`);
  }

  /**
   * Wait until the lab virtual host resolves through DNS to the expected server
   * IP. The bootstrap connects to the server by IP, but several later steps
   * (init.sh / Traefik routing, ACME DNS-01 challenge, the lab manager health
   * check) require the public DNS record to be live and pointing at the right
   * server. This verifies propagation explicitly instead of relying on a stale
   * resolver cache.
   *
   * Both a public resolver AND the OS resolver must agree:
   * - The public resolver (8.8.8.8 / 1.1.1.1) confirms the record has actually
   *   propagated to the world, bypassing a stale negative cache on the host.
   * - The OS resolver ({@link lookup}, which honors /etc/resolv.conf and nsswitch)
   *   is the resolver `ssh` itself uses. If it still holds a cached NXDOMAIN, a
   *   subsequent by-domain ssh would fail with "Could not resolve hostname" even
   *   though the record exists. Requiring it here makes the gate representative
   *   of what ssh will see.
   *
   * @param expectedIp the IP the record must resolve to (the server's public
   * IP). If undefined, any successful resolution is accepted.
   * @param confirmWithSshProbe if true, once both resolvers agree, run one real
   * by-domain ssh probe to confirm the transport works end-to-end (the probe
   * goes by domain only if this service is not pinned to an IP). Defaults to true.
   * @throws BlBadRequestException if DNS does not resolve correctly within the
   * retry budget.
   */
  public async waitForDnsResolution(expectedIp?: string, confirmWithSshProbe: boolean = true): Promise<void> {
    const host = `lab.${this.labVirtualHost}`;
    const countLimit = 30;
    const waitTime = 15000;

    // Use public resolvers so a previously cached negative answer on the local
    // resolver does not keep us from seeing a freshly created record.
    const publicResolver = new Resolver({ timeout: 5000, tries: 1 });
    publicResolver.setServers(['8.8.8.8', '1.1.1.1']);

    for (let count = 0; count < countLimit; count++) {
      const attemptLabel = `Attempt ${count + 1} of ${countLimit}`;

      // 1. public resolver: confirm the record propagated to the world
      const publicAddresses = await this.resolveWithPublicResolver(publicResolver, host);
      const publicOk =
        publicAddresses != null &&
        publicAddresses.length > 0 &&
        (!expectedIp || publicAddresses.includes(expectedIp));

      // 2. OS resolver: confirm the resolver ssh actually uses sees it too
      const osAddress = publicOk ? await this.resolveWithOsResolver(host) : null;
      const osOk = osAddress != null && (!expectedIp || osAddress === expectedIp);

      if (publicOk && osOk) {
        // 3. real by-domain ssh probe: the resolver checks reduce the race
        // window but the OS cache can still flip between the lookup and the
        // command, so confirm with the actual transport before we rely on it.
        if (!confirmWithSshProbe || (await this.checkSshConnection())) {
          this.logger.log(
            `DNS for ${host} resolved (public: ${publicAddresses.join(', ')}, os: ${osAddress}) ` +
              `for lab ${this.labId}`
          );
          return;
        }

        this.logger.log(
          `DNS for ${host} resolved but ssh probe failed for lab ${this.labId}. ${attemptLabel}`
        );
      } else {
        this.logger.log(
          `DNS for ${host} not ready yet for lab ${this.labId}. ${attemptLabel}. ` +
            `Public: ${publicAddresses?.join(', ') ?? 'unresolved'}, os: ${osAddress ?? 'unresolved'}` +
            (expectedIp ? `, expected: ${expectedIp}` : '')
        );
      }

      await new Promise((r) => setTimeout(r, waitTime));
    }

    throw new BlBadRequestException(
      `DNS for ${host} did not resolve` + (expectedIp ? ` to ${expectedIp}` : '') + ` for lab ${this.labId}`
    );
  }

  /**
   * Resolve the host against public resolvers (8.8.8.8 / 1.1.1.1).
   * Returns the resolved IPv4 addresses, or null if it could not be resolved.
   */
  private async resolveWithPublicResolver(resolver: Resolver, host: string): Promise<string[] | null> {
    try {
      return await resolver.resolve4(host);
    } catch (e) {
      this.logger.debug(
        `Public DNS resolution failed for ${host} (lab ${this.labId}): ${CnLabSshService.errorToString(e)}`
      );
      return null;
    }
  }

  /**
   * Resolve the host against the OS resolver (the same path ssh uses).
   * Returns the resolved IPv4 address, or null if it could not be resolved.
   */
  private async resolveWithOsResolver(host: string): Promise<string | null> {
    try {
      const { address } = await lookup(host, { family: 4 });
      return address;
    } catch (e) {
      this.logger.debug(
        `OS DNS resolution failed for ${host} (lab ${this.labId}): ${CnLabSshService.errorToString(e)}`
      );
      return null;
    }
  }

  public async checkSshConnection(): Promise<boolean> {
    // option to add host to fingerprint
    const command = this.getSshCommand(['exit'], ['-q', '-o ConnectTimeout=3']);
    this.logger.log(`Checking ssh connection using ${this.getConnectionDescription()} for lab ${this.labId}`);
    try {
      await this.commandService.execCommand(command, {
        errorMode: CnExecCommandMode.STDERR_AS_WARNING,
        timeout: 10000,
      });
      return true;
    } catch (e) {
      this.logger.log(String(e));
      return false;
    }
  }

  public getUtilsFolder(): string {
    return `${CnLabSshService.LAB_CONFIGURER_FOLDER}/utils`;
  }

  public getMountFolder(): string {
    return `${this.getUtilsFolder()}/mount`;
  }
}
