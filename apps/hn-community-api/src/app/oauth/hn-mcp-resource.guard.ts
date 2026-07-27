import { BlJwtService } from '@monorepo/back-core-lib';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';

import { HnOAuthConfig } from './hn-oauth.config';
import { HN_OAUTH_PATHS } from './hn-oauth.constants';
import { hnExtractBearerToken } from './hn-oauth-bearer.util';

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

    const expectedResource = this.expectedResource(request);
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
      response.setHeader(
        'WWW-Authenticate',
        `Bearer resource_metadata="${this.config.issuer}/${HN_OAUTH_PATHS.protectedResourceMetadata}"`
      );
      throw new UnauthorizedException('invalid_token');
    }
  }

  /** Canonical resource identifier for the endpoint being called: `issuer + path`. */
  private expectedResource(request: Request): string {
    const path = (request.path ?? '').split('?')[0].replace(/\/+$/, '');
    return `${this.config.issuer}${path}`;
  }

  private audienceMatches(aud: string | string[] | undefined, expected: string): boolean {
    if (aud == null) {
      return false;
    }
    return Array.isArray(aud) ? aud.includes(expected) : aud === expected;
  }
}
