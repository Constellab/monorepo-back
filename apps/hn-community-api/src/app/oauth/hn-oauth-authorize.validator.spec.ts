import { HnAuthorizeQueryDto } from './hn-oauth-authorize.dto';
import { hnValidateAuthorizeParams } from './hn-oauth-authorize.validator';
import { HnOAuthClientStore } from './hn-oauth-client.store';

const RESOURCE = 'http://localhost:3333/mcp/community-doc';
const REDIRECT = 'http://localhost:8080/callback';
const CHALLENGE = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';

const registry = { isKnownResource: (r: string) => r === RESOURCE };

function setup(): { clients: HnOAuthClientStore; clientId: string } {
  const clients = new HnOAuthClientStore();
  const client = clients.register({ redirect_uris: [REDIRECT] });
  return { clients, clientId: client.client_id };
}

function validQuery(clientId: string): HnAuthorizeQueryDto {
  return {
    response_type: 'code',
    client_id: clientId,
    redirect_uri: REDIRECT,
    code_challenge: CHALLENGE,
    code_challenge_method: 'S256',
    resource: RESOURCE,
    state: 'xyz',
  };
}

describe('hnValidateAuthorizeParams', () => {
  it('accepts a well-formed request', () => {
    const { clients, clientId } = setup();
    const result = hnValidateAuthorizeParams(validQuery(clientId), clients, registry);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.params.redirectUri).toBe(REDIRECT);
      expect(result.params.resource).toBe(RESOURCE);
      expect(result.params.codeChallenge).toBe(CHALLENGE);
      expect(result.params.state).toBe('xyz');
    }
  });

  it('rejects an unknown client BEFORE redirect (no open redirect)', () => {
    const { clients } = setup();
    const result = hnValidateAuthorizeParams({ ...validQuery('nope'), client_id: 'nope' }, clients, registry);
    expect(result).toMatchObject({ ok: false, kind: 'pre_redirect', error: 'invalid_client' });
  });

  it('rejects an unregistered redirect_uri BEFORE redirect', () => {
    const { clients, clientId } = setup();
    const result = hnValidateAuthorizeParams(
      { ...validQuery(clientId), redirect_uri: 'http://evil.example/cb' },
      clients,
      registry
    );
    expect(result).toMatchObject({ ok: false, kind: 'pre_redirect' });
  });

  it('reports a bad response_type by redirect (post_redirect) with state', () => {
    const { clients, clientId } = setup();
    const result = hnValidateAuthorizeParams(
      { ...validQuery(clientId), response_type: 'token' },
      clients,
      registry
    );
    expect(result).toMatchObject({
      ok: false,
      kind: 'post_redirect',
      redirectUri: REDIRECT,
      state: 'xyz',
      error: 'unsupported_response_type',
    });
  });

  it('requires a PKCE S256 challenge', () => {
    const { clients, clientId } = setup();
    const noChallenge = hnValidateAuthorizeParams(
      { ...validQuery(clientId), code_challenge: undefined },
      clients,
      registry
    );
    expect(noChallenge).toMatchObject({ kind: 'post_redirect', error: 'invalid_request' });

    const plain = hnValidateAuthorizeParams(
      { ...validQuery(clientId), code_challenge_method: 'plain' },
      clients,
      registry
    );
    expect(plain).toMatchObject({ kind: 'post_redirect', error: 'invalid_request' });
  });

  it('requires a known resource (audience)', () => {
    const { clients, clientId } = setup();
    const result = hnValidateAuthorizeParams(
      { ...validQuery(clientId), resource: 'http://localhost:3333/mcp/unknown' },
      clients,
      registry
    );
    expect(result).toMatchObject({ kind: 'post_redirect', error: 'invalid_target' });
  });
});
