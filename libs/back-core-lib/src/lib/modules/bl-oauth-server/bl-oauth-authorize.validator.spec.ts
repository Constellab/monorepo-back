import { BlResourceLookup } from '../bl-resource-server/bl-resource-server.class';
import { BlOAuthAuthorizeQueryDto } from './bl-oauth-authorize.dto';
import { blValidateAuthorizeParams } from './bl-oauth-authorize.validator';
import { BlOAuthClientStore } from './bl-oauth-client.store';
import { BlOAuthRedisMock } from './bl-oauth-redis.mock';

const RESOURCE = 'http://localhost:3333/mcp/community-doc';
const REDIRECT = 'http://localhost:8080/callback';
const CHALLENGE = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';

const OTHER_RESOURCE = 'http://localhost:3333/mcp/space';

/**
 * The Resource Server half's contract, as this validation asks it. Two served Resources, so
 * a request naming several can be told apart from one naming an unserved one.
 */
const registry: BlResourceLookup = {
  isKnownResource: (url: string) => url === RESOURCE || url === OTHER_RESOURCE,
  describeResource: (url: string) => (registry.isKnownResource(url) ? { url, name: 'A Resource' } : null),
};

async function setup(): Promise<{ clients: BlOAuthClientStore; clientId: string }> {
  const clients = new BlOAuthClientStore(new BlOAuthRedisMock());
  const client = await clients.register({ redirect_uris: [REDIRECT] });
  return { clients, clientId: client.client_id };
}

function validQuery(clientId: string): BlOAuthAuthorizeQueryDto {
  return {
    response_type: 'code',
    client_id: clientId,
    redirect_uri: REDIRECT,
    code_challenge: CHALLENGE,
    code_challenge_method: 'S256',
    resource: [RESOURCE],
    state: 'xyz',
  };
}

describe('blValidateAuthorizeParams', () => {
  it('accepts a well-formed request', async () => {
    const { clients, clientId } = await setup();
    const result = await blValidateAuthorizeParams(validQuery(clientId), clients, registry);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.params.redirectUri).toBe(REDIRECT);
      expect(result.params.resources).toEqual([RESOURCE]);
      expect(result.params.codeChallenge).toBe(CHALLENGE);
      expect(result.params.state).toBe('xyz');
    }
  });

  it('rejects an unknown client BEFORE redirect (no open redirect)', async () => {
    const { clients } = await setup();
    const result = await blValidateAuthorizeParams(
      { ...validQuery('nope'), client_id: 'nope' },
      clients,
      registry
    );
    expect(result).toMatchObject({ ok: false, kind: 'pre_redirect', error: 'invalid_client' });
  });

  it('rejects an unregistered redirect_uri BEFORE redirect', async () => {
    const { clients, clientId } = await setup();
    const result = await blValidateAuthorizeParams(
      { ...validQuery(clientId), redirect_uri: 'http://evil.example/cb' },
      clients,
      registry
    );
    expect(result).toMatchObject({ ok: false, kind: 'pre_redirect' });
  });

  it('reports a bad response_type by redirect (post_redirect) with state', async () => {
    const { clients, clientId } = await setup();
    const result = await blValidateAuthorizeParams(
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

  it('requires a PKCE S256 challenge', async () => {
    const { clients, clientId } = await setup();
    const noChallenge = await blValidateAuthorizeParams(
      { ...validQuery(clientId), code_challenge: undefined },
      clients,
      registry
    );
    expect(noChallenge).toMatchObject({ kind: 'post_redirect', error: 'invalid_request' });

    const plain = await blValidateAuthorizeParams(
      { ...validQuery(clientId), code_challenge_method: 'plain' },
      clients,
      registry
    );
    expect(plain).toMatchObject({ kind: 'post_redirect', error: 'invalid_request' });
  });

  it('requires a known resource (audience)', async () => {
    const { clients, clientId } = await setup();
    const result = await blValidateAuthorizeParams(
      { ...validQuery(clientId), resource: ['http://localhost:3333/mcp/unknown'] },
      clients,
      registry
    );
    expect(result).toMatchObject({ kind: 'post_redirect', error: 'invalid_target' });
  });

  it('requires at least one resource', async () => {
    const { clients, clientId } = await setup();

    // An audience-less token would be accepted as a full session credential everywhere else
    // in the API, so "no resource" is not a request that can be honoured.
    for (const resource of [undefined, [] as string[]]) {
      const result = await blValidateAuthorizeParams(
        { ...validQuery(clientId), resource },
        clients,
        registry
      );
      expect(result).toMatchObject({ kind: 'post_redirect', error: 'invalid_target' });
    }
  });

  it('accepts several resources in one request, which is one pass through consent', async () => {
    const { clients, clientId } = await setup();

    const result = await blValidateAuthorizeParams(
      { ...validQuery(clientId), resource: [RESOURCE, OTHER_RESOURCE] },
      clients,
      registry
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.params.resources).toEqual([RESOURCE, OTHER_RESOURCE]);
    }
  });

  it('deduplicates a resource named twice', async () => {
    const { clients, clientId } = await setup();

    const result = await blValidateAuthorizeParams(
      { ...validQuery(clientId), resource: [RESOURCE, RESOURCE] },
      clients,
      registry
    );

    // Otherwise the same Resource is listed twice on the consent screen and approved twice
    // into the one Grant it can produce.
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.params.resources).toEqual([RESOURCE]);
    }
  });

  it('rejects the whole request when one of several resources is unknown', async () => {
    const { clients, clientId } = await setup();

    const result = await blValidateAuthorizeParams(
      { ...validQuery(clientId), resource: [RESOURCE, 'http://localhost:3333/mcp/unknown'] },
      clients,
      registry
    );

    // Checking only the first entry would let an unserved audience be approved alongside a
    // served one, and minted for afterwards.
    expect(result).toMatchObject({ kind: 'post_redirect', error: 'invalid_target' });
  });
});
