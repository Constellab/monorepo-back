import { Logger } from '@nestjs/common';

import { BlJwks } from './bl-jwt-key.class';
import { blKeyId } from './bl-jwt-key.util';
import { BlJwtRemoteKeyStore } from './bl-jwt-remote-key.store';
import { BlTestAuthorizationServer } from './bl-mcp-token.mock';

const AUTHORIZATION_SERVER = 'https://api.example.com';
const JWKS_URL = `${AUTHORIZATION_SERVER}/.well-known/jwks.json`;

/**
 * The Authorization Server's key set, as it arrives over HTTP. Generated rather than
 * hard-coded so the `kid` is a real thumbprint of a real key.
 */
const SPACE_API = BlTestAuthorizationServer.generate();

/** The published document, served to the store under test. */
function serving(document: unknown, status = 200): jest.Mock {
  return jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(document),
  });
}

function buildStore(
  fetchMock: jest.Mock,
  authorizationServerUrl = AUTHORIZATION_SERVER
): BlJwtRemoteKeyStore {
  globalThis.fetch = fetchMock;
  return new BlJwtRemoteKeyStore({ authorizationServerUrl });
}

describe('BlJwtRemoteKeyStore', () => {
  const realFetch = globalThis.fetch;

  /**
   * The store logs a failed fetch for the operator and swallows it. Stubbed rather than
   * left to write: the failure paths below are exercised on purpose, and a suite that
   * prints six stack-less ERROR lines on a green run teaches the reader to skim past
   * exactly the output that matters when the run is not green. Asserted, further down,
   * where that log is itself the behaviour under test.
   */
  let loggedErrors: jest.SpyInstance;

  beforeEach(() => {
    loggedErrors = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
    jest.restoreAllMocks();
  });

  /** Move the clock past the refetch cooldown, as a rotation on the other side would. */
  function afterTheCooldown(): void {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now + 120_000);
  }

  describe('where it looks', () => {
    it('derives the key set URL from the authorization server, not from configuration', () => {
      // Derived from the same constant the publishing route is mounted on, so the URL
      // fetched and the URL served cannot be configured apart.
      expect(buildStore(serving(SPACE_API.jwks)).jwksUrl).toBe(JWKS_URL);
    });

    it('tolerates a trailing slash on the configured host', () => {
      expect(buildStore(serving(SPACE_API.jwks), `${AUTHORIZATION_SERVER}/`).jwksUrl).toBe(JWKS_URL);
    });

    it('fetches nothing until a token actually needs a key', () => {
      // Startup must not depend on the Authorization Server being reachable: a Resource
      // Server that failed to boot would take browser login down with it.
      const fetchMock = serving(SPACE_API.jwks);
      buildStore(fetchMock);

      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('resolving a key', () => {
    it('returns the published key a token names', async () => {
      const store = buildStore(serving(SPACE_API.jwks));

      const key = await store.publicKeyFor(SPACE_API.signingKid);

      expect(key).not.toBeNull();
      expect(blKeyId(key!)).toBe(SPACE_API.signingKid);
    });

    it('caches, so a second call costs no request', async () => {
      const fetchMock = serving(SPACE_API.jwks);
      const store = buildStore(fetchMock);

      await store.publicKeyFor(SPACE_API.signingKid);
      await store.publicKeyFor(SPACE_API.signingKid);

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('shares one request between concurrent callers', async () => {
      const fetchMock = serving(SPACE_API.jwks);
      const store = buildStore(fetchMock);

      // The normal case right after a restart: a burst of MCP calls, none of which should
      // open its own connection to the Authorization Server.
      await Promise.all([
        store.publicKeyFor(SPACE_API.signingKid),
        store.publicKeyFor(SPACE_API.signingKid),
        store.publicKeyFor(SPACE_API.signingKid),
      ]);

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('resolves nothing when a token names no key, rather than taking the only one', async () => {
      const fetchMock = serving(SPACE_API.jwks);

      expect(await buildStore(fetchMock).publicKeyFor(undefined)).toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('resolves nothing for a key the document does not carry', async () => {
      expect(await buildStore(serving(SPACE_API.jwks)).publicKeyFor('not-published')).toBeNull();
    });
  });

  describe('what it refuses to verify with', () => {
    it('ignores a key published for another algorithm', async () => {
      const foreignAlgorithm: BlJwks = {
        keys: SPACE_API.jwks.keys.map((key) => ({ ...key, alg: 'RS512' as never })),
      };

      // A verifier pinned to RS256 must not be handed a key the document says is for
      // something else — the document is fetched over the network and every member of it
      // is untrusted until checked.
      expect(await buildStore(serving(foreignAlgorithm)).publicKeyFor(SPACE_API.signingKid)).toBeNull();
    });

    it('ignores a key published for encryption rather than signatures', async () => {
      const forEncryption: BlJwks = {
        keys: SPACE_API.jwks.keys.map((key) => ({ ...key, use: 'enc' as never })),
      };

      expect(await buildStore(serving(forEncryption)).publicKeyFor(SPACE_API.signingKid)).toBeNull();
    });

    it('keeps the usable entries of a document that also carries an unusable one', async () => {
      const mixed: BlJwks = {
        keys: [{ ...SPACE_API.jwks.keys[0], kid: 'unusable', alg: 'RS512' as never }, ...SPACE_API.jwks.keys],
      };

      // A rotation towards an algorithm we do not accept must not cost the key that is
      // still signing everything in flight.
      expect(await buildStore(serving(mixed)).publicKeyFor(SPACE_API.signingKid)).not.toBeNull();
    });
  });

  describe('when the authorization server cannot be reached', () => {
    it('refuses rather than accepts, and keeps serving', async () => {
      const store = buildStore(jest.fn().mockRejectedValue(new Error('ECONNREFUSED')));

      await expect(store.publicKeyFor(SPACE_API.signingKid)).resolves.toBeNull();
    });

    it('does not retry on every call, so a failing server is not hammered', async () => {
      const fetchMock = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));
      const store = buildStore(fetchMock);

      await store.publicKeyFor(SPACE_API.signingKid);
      await store.publicKeyFor(SPACE_API.signingKid);
      await store.publicKeyFor(SPACE_API.signingKid);

      // The worst moment to add load to an application that is already down is when every
      // call at an unauthenticated endpoint turns into a request at it.
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('keeps the keys it already had when a later fetch fails', async () => {
      const fetchMock = serving(SPACE_API.jwks);
      const store = buildStore(fetchMock);
      await store.publicKeyFor(SPACE_API.signingKid);

      fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));

      expect(await store.publicKeyFor(SPACE_API.signingKid)).not.toBeNull();
    });

    it('treats a non-200 response as a failure rather than as an empty key set', async () => {
      const store = buildStore(serving({ keys: [] }, 503));

      await expect(store.publicKeyFor(SPACE_API.signingKid)).resolves.toBeNull();
    });

    it('treats a document naming no usable key as a failure', async () => {
      const store = buildStore(serving({ keys: [] }));

      await expect(store.publicKeyFor(SPACE_API.signingKid)).resolves.toBeNull();
    });

    it('names the document it could not read, rather than refusing silently', async () => {
      const store = buildStore(jest.fn().mockRejectedValue(new Error('ECONNREFUSED')));

      await store.publicKeyFor(SPACE_API.signingKid);

      // A Resource Server refusing every MCP call because it cannot reach the key set is
      // indistinguishable, from the caller's side, from one refusing them for a bad
      // token. The operator only gets to tell the two apart if this line says which
      // document went unread.
      expect(loggedErrors).toHaveBeenCalledWith(expect.stringContaining(JWKS_URL));
    });
  });

  describe('picking up a rotation', () => {
    it('refetches for an unknown key once the cooldown has passed', async () => {
      const rotated = BlTestAuthorizationServer.generate();
      const fetchMock = serving(SPACE_API.jwks);
      const store = buildStore(fetchMock);
      await store.publicKeyFor(SPACE_API.signingKid);

      // The Authorization Server rotates; the Resource Server is not redeployed.
      fetchMock.mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve(rotated.jwks) });
      afterTheCooldown();

      expect(await store.publicKeyFor(rotated.signingKid)).not.toBeNull();
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('drops a key the document no longer carries', async () => {
      const rotated = BlTestAuthorizationServer.generate();
      const fetchMock = serving(SPACE_API.jwks);
      const store = buildStore(fetchMock);
      await store.publicKeyFor(SPACE_API.signingKid);

      fetchMock.mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve(rotated.jwks) });
      afterTheCooldown();
      await store.publicKeyFor(rotated.signingKid);

      // The published document is the whole truth about which keys verify: a key retired
      // there has to stop verifying here, or retiring one would mean nothing until every
      // Resource Server restarted.
      expect(await store.publicKeyFor(SPACE_API.signingKid)).toBeNull();
    });
  });
});
