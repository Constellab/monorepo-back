import { BlJwtService } from '@monorepo/back-core-lib';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';

import { HnOAuthConfig } from './hn-oauth.config';
import { hnExtractBearerToken } from './hn-oauth-bearer.util';
import { hnProtectedResourceMetadataUrl } from './hn-oauth-resource-url.util';

/**
 * Generic OAuth 2.0 Resource Server guard for MCP endpoints.
 *
 * Resource-agnostic: the expected audience is derived from the request's own URL
 * (`issuer + path`), so any MCP mounted at a registered resource path is protected
 * identically — community-doc now, space/gateway later.
 *
 * On any failure it emits `WWW-Authenticate: Bearer resource_metadata="…"` before
 * returning 401 — that header is what makes an MCP client (Claude) start the OAuth
 * discovery flow.
 */
@Injectable()
export class HnMcpResourceGuard implements CanActivate {
  constructor(
    private readonly jwtService: BlJwtService,
    private readonly config: HnOAuthConfig
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const resourcePath = this.resourcePath(request);
    const expectedResource = `${this.config.issuer}${resourcePath}`;
    const token = hnExtractBearerToken(request.headers?.authorization);

    try {
      if (!token || !this.config.isKnownResource(expectedResource)) {
        throw new UnauthorizedException();
      }
      const payload = this.jwtService.verifyToken(token);
      if (!this.audienceMatches(payload.aud, expectedResource)) {
        throw new UnauthorizedException();
      }
      return true;
    } catch {
      // The document for THIS resource, not a shared one: it is the only thing telling
      // the client which audience to ask for, and every MCP on this host needs a
      // different one.
      response.setHeader(
        'WWW-Authenticate',
        `Bearer resource_metadata="${hnProtectedResourceMetadataUrl(this.config.issuer, resourcePath)}"`
      );
      throw new UnauthorizedException('invalid_token');
    }
  }

  /** Path component of the endpoint being called, normalized like a resource identifier. */
  private resourcePath(request: Request): string {
    return (request.path ?? '').split('?')[0].replace(/\/+$/, '');
  }

  private audienceMatches(aud: string | string[] | undefined, expected: string): boolean {
    if (!aud) {
      return false;
    }
    return Array.isArray(aud) ? aud.includes(expected) : aud === expected;
  }
}
