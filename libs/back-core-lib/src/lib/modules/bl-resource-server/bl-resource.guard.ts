import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';

import { BlJwtAsymmetricService } from '../bl-jwt/bl-jwt-asymmetric.service';
import { blExtractBearerToken } from '../bl-oauth/bl-oauth-bearer.util';
import { blProtectedResourceMetadataUrl } from '../bl-oauth/bl-oauth-resource-url.util';
import { blStripTrailingSlashes } from '../bl-oauth/bl-oauth-url.util';
import { BlResourceRegistry } from './bl-resource.registry';

/**
 * OAuth 2.0 Resource Server guard.
 *
 * Resource-agnostic: the expected audience is derived from the request's own URL
 * (`baseUrl + path`) and matched against the registry, so any surface registered as a
 * Resource is protected identically — the Community MCP now, the Space API MCP and the
 * APIs themselves later.
 *
 * On any failure it emits `WWW-Authenticate: Bearer resource_metadata="…"` before
 * returning 401 — that header is what makes an MCP client (Claude) start the OAuth
 * discovery flow.
 *
 * Verifies through `BlJwtAsymmetricService`, which accepts RS256 and nothing else. The
 * Session token verifier is a different service accepting HS256 and nothing else, and
 * neither can be reached from here: that is the point. A Resource Server needs only the
 * published public key — it holds no ability to mint what it accepts.
 */
@Injectable()
export class BlResourceGuard implements CanActivate {
  constructor(
    private readonly mcpJwtService: BlJwtAsymmetricService,
    private readonly registry: BlResourceRegistry
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const resourcePath = this.resourcePath(request);
    // Through the registry, so the identifier compared here is assembled exactly as the
    // one it is compared against.
    const expectedResource = this.registry.resourceUrl(resourcePath);
    const token = blExtractBearerToken(request.headers?.authorization);

    try {
      if (!token || !this.registry.isKnownResource(expectedResource)) {
        throw new UnauthorizedException();
      }
      const payload = this.mcpJwtService.verifyToken(token);
      if (!this.audienceMatches(payload.aud, expectedResource)) {
        throw new UnauthorizedException();
      }
      return true;
    } catch {
      // The document for THIS resource, not a shared one: it is the only thing telling
      // the client which audience to ask for, and every Resource on this host needs a
      // different one.
      response.setHeader(
        'WWW-Authenticate',
        `Bearer resource_metadata="${blProtectedResourceMetadataUrl(this.registry.baseUrl, resourcePath)}"`
      );
      throw new UnauthorizedException('invalid_token');
    }
  }

  /** Path component of the endpoint being called, normalized like a resource identifier. */
  private resourcePath(request: Request): string {
    return blStripTrailingSlashes((request.path ?? '').split('?')[0]);
  }

  private audienceMatches(aud: string | string[] | undefined, expected: string): boolean {
    if (!aud) {
      return false;
    }
    return Array.isArray(aud) ? aud.includes(expected) : aud === expected;
  }
}
