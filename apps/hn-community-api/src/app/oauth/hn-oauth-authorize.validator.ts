import { BlResourceLookup } from '@monorepo/back-core-lib';

import { HnAuthorizeQueryDto } from './hn-oauth-authorize.dto';
import { HnOAuthClient } from './hn-oauth-client.store';

export interface HnAuthorizeParams {
  client: HnOAuthClient;
  redirectUri: string;
  codeChallenge: string;
  resource: string;
  state?: string;
}

/**
 * Result of validating `/authorize` params.
 * - `pre_redirect`: client_id / redirect_uri are untrusted → the caller MUST render
 *   the error directly and MUST NOT redirect (open-redirect defense).
 * - `post_redirect`: redirect_uri is validated → the caller redirects the error back
 *   to it with `error` + `state`.
 */
export type HnAuthorizeValidation =
  | { ok: true; params: HnAuthorizeParams }
  | { ok: false; kind: 'pre_redirect'; error: string; errorDescription: string }
  | {
      ok: false;
      kind: 'post_redirect';
      redirectUri: string;
      state?: string;
      error: string;
      errorDescription: string;
    };

export interface HnClientLookup {
  find(clientId: string): Promise<HnOAuthClient | null>;
  redirectUriAllowed(client: HnOAuthClient, redirectUri: string): boolean;
}

/**
 * Validate an authorization request (Authorization Code + PKCE, RFC 6749 / 7636 /
 * 8707). Pure: no session check, no code creation — that is the controller's job.
 *
 * Parameter types are guaranteed by the `ValidationPipe` + {@link HnAuthorizeQueryDto};
 * empty strings are still treated as absent.
 */
export async function hnValidateAuthorizeParams(
  query: HnAuthorizeQueryDto,
  clients: HnClientLookup,
  // The library's contract, not a restatement of it: this application serves the
  // Resources it mints tokens for, so one list answers both questions.
  registry: BlResourceLookup
): Promise<HnAuthorizeValidation> {
  // 1. client_id + redirect_uri must be trusted before we can redirect anything.
  const client = query.client_id ? await clients.find(query.client_id) : null;
  if (!client) {
    return {
      ok: false,
      kind: 'pre_redirect',
      error: 'invalid_client',
      errorDescription: 'unknown or missing client_id',
    };
  }

  const redirectUri = query.redirect_uri;
  if (!redirectUri || !clients.redirectUriAllowed(client, redirectUri)) {
    return {
      ok: false,
      kind: 'pre_redirect',
      error: 'invalid_request',
      errorDescription: 'missing or unregistered redirect_uri',
    };
  }

  const state = query.state || undefined;
  const fail = (error: string, errorDescription: string): HnAuthorizeValidation => ({
    ok: false,
    kind: 'post_redirect',
    redirectUri,
    state,
    error,
    errorDescription,
  });

  // 2. Everything below can be reported by redirecting back to redirect_uri.
  if (query.response_type !== 'code') {
    return fail('unsupported_response_type', 'only response_type=code is supported');
  }

  const codeChallenge = query.code_challenge;
  if (!codeChallenge || query.code_challenge_method !== 'S256') {
    return fail('invalid_request', 'PKCE code_challenge with S256 is required');
  }

  const resource = query.resource;
  if (!resource || !registry.isKnownResource(resource)) {
    return fail('invalid_target', 'missing or unknown resource');
  }

  return {
    ok: true,
    params: { client, redirectUri, codeChallenge, resource, state },
  };
}
