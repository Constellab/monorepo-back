import { Injectable } from '@nestjs/common';

import { HnCoreConfigService } from '../core/modules/core-config/hn-core-config.service';

/**
 * Path of the community-doc MCP resource, relative to the issuer.
 * Future MCP resources (space, gateway, …) get their own entry here — the OAuth
 * server itself stays resource-agnostic.
 */
export const HN_MCP_COMMUNITY_DOC_RESOURCE_PATH = 'mcp/community-doc';

/**
 * Configuration surface of the (general) Constellab OAuth 2.1 server: the issuer
 * and the registry of resource identifiers (audiences) it may mint tokens for.
 */
@Injectable()
export class HnOAuthConfig {
  constructor(private readonly coreConfig: HnCoreConfigService) {}

  /** Issuer = base URL serving the `.well-known` documents (no trailing slash). */
  get issuer(): string {
    return this.coreConfig.getApiUrl().replace(/\/+$/, '');
  }

  /**
   * Front-end login page the /authorize endpoint redirects to when there is no
   * active session. The front must honor a `returnUrl` param and come back to it
   * after login (cross-repo dependency — see the OAuth plan).
   */
  get frontLoginUrl(): string {
    return `${this.coreConfig.getFrontBaseUrl().replace(/\/+$/, '')}/login`;
  }

  /**
   * Non-loopback redirect URIs a client may register.
   */
  get allowedRedirectUris(): string[] {
    return this.coreConfig.getOAuthAllowedRedirectUris();
  }

  /** Registry of allowed resource URIs (token audiences). */
  get resources(): string[] {
    return [this.resourceUrl(HN_MCP_COMMUNITY_DOC_RESOURCE_PATH)];
  }

  resourceUrl(resourcePath: string): string {
    return `${this.issuer}/${resourcePath}`;
  }

  isKnownResource(resource: string): boolean {
    return this.resources.includes(resource);
  }
}
