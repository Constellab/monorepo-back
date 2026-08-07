import { BlResourceLookup } from '../bl-resource-server/bl-resource-server.class';
import { BlOAuthAuthorizeQueryDto } from './bl-oauth-authorize.dto';
import { BlOAuthClient } from './bl-oauth-client.store';

export interface BlOAuthAuthorizeParams {
  client: BlOAuthClient;
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
export type BlOAuthAuthorizeValidation =
  | { ok: true; params: BlOAuthAuthorizeParams }
  | { ok: false; kind: 'pre_redirect'; error: string; errorDescription: string }
  | {
      ok: false;
      kind: 'post_redirect';
      redirectUri: string;
      state?: string;
      error: string;
      errorDescription: string;
    };

/**
 * The two questions this asks of the client store, declared as the questions rather than
 * the store, so the validation stays a pure function with no Nest provider to stand up.
 */
export interface BlOAuthClientLookup {
  find(clientId: string): Promise<BlOAuthClient | null>;
  redirectUriAllowed(client: BlOAuthClient, redirectUri: string): boolean;
}

/**
 * Validate an authorization request (Authorization Code + PKCE, RFC 6749 / 7636 /
 * 8707). Pure: no session check, no code creation — that is the controller's job.
 *
 * Parameter types are guaranteed by the `ValidationPipe` + {@link BlOAuthAuthorizeQueryDto};
 * empty strings are still treated as absent.
 */
export async function blValidateAuthorizeParams(
  query: BlOAuthAuthorizeQueryDto,
  clients: BlOAuthClientLookup,
  // The Resource Server half's contract, not a restatement of it: the audience this server
  // writes into a token and the audience a Resource Server checks it against have to come
  // from one list.
  registry: BlResourceLookup
): Promise<BlOAuthAuthorizeValidation> {
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
  const fail = (error: string, errorDescription: string): BlOAuthAuthorizeValidation => ({
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
