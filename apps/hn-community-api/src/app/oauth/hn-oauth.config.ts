import { blStripTrailingSlashes } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';

import { HnCoreConfigService } from '../core/modules/core-config/hn-core-config.service';

/**
 * Longest `client_name` accepted at registration.
 *
 * Ours rather than the shared policy's: the shared redirect URI policy never reads the
 * client name, and it is this application's own client store that keeps it for the
 * lifetime of the client. Bounded so a public endpoint cannot be used to park unbounded
 * attacker-supplied text there.
 */
export const HN_OAUTH_MAX_CLIENT_NAME_LENGTH = 200;

/**
 * Configuration surface of the (general) Constellab OAuth 2.1 authorization server.
 *
 * The Resources it may mint tokens for are not here: they belong to the Resource Server
 * half, which the library owns — see `BlResourceRegistry`.
 */
@Injectable()
export class HnOAuthConfig {
  constructor(private readonly coreConfig: HnCoreConfigService) {}

  /** Issuer = base URL serving the `.well-known` documents (no trailing slash). */
  get issuer(): string {
    return blStripTrailingSlashes(this.coreConfig.getApiUrl());
  }

  /**
   * Front-end login page the /authorize endpoint redirects to when there is no
   * active session. The front must honor a `returnUrl` param and come back to it
   * after login (cross-repo dependency — see the OAuth plan).
   */
  get frontLoginUrl(): string {
    return `${blStripTrailingSlashes(this.coreConfig.getFrontBaseUrl())}/login`;
  }

  /**
   * Non-loopback redirect URIs a client may register.
   */
  get allowedRedirectUris(): string[] {
    return this.coreConfig.getOAuthAllowedRedirectUris();
  }

  /**
   * Lifetime of an MCP access token.
   *
   * Read through this single getter by both the signature and the `expires_in` the
   * client is told, so they cannot drift: they used to agree only because each side
   * happened to reach for the same constant.
   */
  get mcpAccessTokenDurationInSeconds(): number {
    return this.coreConfig.getMcpAccessTokenDurationInSeconds();
  }
}
