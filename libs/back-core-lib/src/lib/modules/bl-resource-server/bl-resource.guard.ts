import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';

import { BlDecodedToken } from '../bl-jwt/bl-jwt.class';
import { BlJwtAsymmetricVerifier } from '../bl-jwt/bl-jwt-asymmetric.verifier';
import { blExtractBearerToken } from '../bl-oauth/bl-oauth-bearer.util';
import { blProtectedResourceMetadataUrl } from '../bl-oauth/bl-oauth-resource-url.util';
import { blStripTrailingSlashes } from '../bl-oauth/bl-oauth-url.util';
import { BlResourceRegistry } from './bl-resource.registry';

/**
 * A request that has passed {@link BlResourceGuard}, carrying the payload it accepted.
 *
 * The guard is the only place a token is verified, so whoever needs to know *who* is
 * calling reads what the guard already established rather than parsing the header again —
 * a second parse is a second chance to accept something the guard would have refused.
 */
export interface BlResourceRequest extends Request {
  blResourceToken?: BlDecodedToken;
}

/**
 * The token payload {@link BlResourceGuard} accepted for this request, or null when the
 * request never went through it.
 *
 * Null is not "anonymous but fine": it means the caller is reading a request the guard
 * never cleared, which every caller has to refuse rather than default around.
 */
export function blResourceTokenOf(request: Request): BlDecodedToken | null {
  return (request as BlResourceRequest).blResourceToken ?? null;
}

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
 * Verifies through `BlJwtAsymmetricVerifier`, which accepts RS256 and nothing else. The
 * Session token verifier is a different service accepting HS256 and nothing else, and
 * neither can be reached from here: that is the point. Where the verifier's public keys
 * come from is the mounting application's business — its own key store when it is the
 * Authorization Server, the published key set when it is not — and this guard is the same
 * either way, holding no ability to mint what it accepts.
 */
@Injectable()
export class BlResourceGuard implements CanActivate {
  constructor(
    private readonly mcpJwtVerifier: BlJwtAsymmetricVerifier,
    private readonly registry: BlResourceRegistry
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const resourcePath = this.resourcePath(request);
    // Through the registry, so the identifier compared here is assembled exactly as the
    // one it is compared against.
    const expectedResource = this.registry.resourceUrl(resourcePath);
    const token = blExtractBearerToken(request.headers?.authorization);

    try {
      // `servesResource`, not `isKnownResource`: a Resource this application only mints
      // tokens for is served on another host, and a token for it reaching an endpoint here
      // is a token being replayed at the wrong audience.
      if (!token || !this.registry.servesResource(expectedResource)) {
        throw new UnauthorizedException();
      }
      const payload = await this.mcpJwtVerifier.verifyToken(token);
      if (!this.audienceMatches(payload.aud, expectedResource)) {
        throw new UnauthorizedException();
      }
      // Published only once every check has passed, so nothing downstream can read a
      // payload this guard was about to refuse.
      (request as BlResourceRequest).blResourceToken = payload;
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
