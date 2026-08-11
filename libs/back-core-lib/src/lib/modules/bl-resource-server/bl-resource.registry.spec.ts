import { BlResourceRegistry } from './bl-resource.registry';
import {
  BlResourceDefinition,
  BlResourceDescription,
  BlResourceServerConfig,
} from './bl-resource-server.class';

const BASE_URL = 'https://community.example.com';
const AUTH_SERVER_URL = 'https://api.example.com';
/** A Resource of another application, which this one only mints tokens for. */
const REMOTE_BASE_URL = 'https://other.example.com';
const REMOTE_RESOURCE = `${REMOTE_BASE_URL}/mcp/elsewhere`;

/** A Resource entry, when what is under test is the path rather than the words. */
function resource(path: string, overrides: Partial<BlResourceDefinition> = {}): BlResourceDefinition {
  return { path, name: 'The documentation', ...overrides };
}

/** A remote entry — a full URL, because it is not under this application's base URL. */
function remote(overrides: Partial<BlResourceDescription> = {}): BlResourceDescription {
  return { url: REMOTE_RESOURCE, name: 'Another application', ...overrides };
}

function buildRegistry(overrides: Partial<BlResourceServerConfig> = {}): BlResourceRegistry {
  return new BlResourceRegistry({
    baseUrl: BASE_URL,
    authorizationServerUrl: AUTH_SERVER_URL,
    resources: [resource('mcp/community-doc')],
    ...overrides,
  });
}

describe('BlResourceRegistry', () => {
  describe('resource identifiers', () => {
    it('builds one absolute URL per configured path', () => {
      const registry = buildRegistry({ resources: [resource('mcp/community-doc'), resource('mcp/space')] });

      expect(registry.resources).toEqual([`${BASE_URL}/mcp/community-doc`, `${BASE_URL}/mcp/space`]);
    });

    it('accepts a path written with a leading slash, which names the same resource', () => {
      expect(buildRegistry({ resources: [resource('/mcp/community-doc')] }).resources).toEqual([
        `${BASE_URL}/mcp/community-doc`,
      ]);
    });

    it('normalizes trailing slashes on both the base URL and the path', () => {
      const registry = buildRegistry({
        baseUrl: `${BASE_URL}/`,
        resources: [resource('mcp/community-doc/')],
      });

      // A resource identifier has to byte-match the URL a client calls, and a client is
      // free to add or drop the slash — so one spelling has to win here.
      expect(registry.resources).toEqual([`${BASE_URL}/mcp/community-doc`]);
      expect(registry.baseUrl).toBe(BASE_URL);
    });

    it('registers an identifier that is not an MCP endpoint', () => {
      // Per ADR-0002 a Resource is any protected surface identified by its URL. The CLI
      // work registers whole APIs, so the empty path — the application itself — has to be
      // a legitimate entry rather than an accident.
      const registry = buildRegistry({ resources: [resource(''), resource('v1/documents')] });

      expect(registry.resources).toEqual([BASE_URL, `${BASE_URL}/v1/documents`]);
    });
  });

  describe('servesResource', () => {
    it('recognizes a registered resource', () => {
      expect(buildRegistry().servesResource(`${BASE_URL}/mcp/community-doc`)).toBe(true);
    });

    it('refuses a resource on another host, however similar the path', () => {
      expect(buildRegistry().servesResource(`${AUTH_SERVER_URL}/mcp/community-doc`)).toBe(false);
    });

    it('refuses a path that is not registered', () => {
      expect(buildRegistry().servesResource(`${BASE_URL}/mcp/space`)).toBe(false);
    });

    it('refuses a prefix of a registered resource', () => {
      // Matching on a prefix would let `/mcp` accept tokens minted for `/mcp/community-doc`.
      expect(buildRegistry().servesResource(`${BASE_URL}/mcp`)).toBe(false);
    });

    it('refuses a remote resource, which is served by another application', () => {
      // The distinction the whole split exists for: this application mints tokens for that
      // URL and must not honour one presented against its own endpoints. The guard asks
      // this question, so a false here is what keeps a foreign audience out.
      const registry = buildRegistry({ remoteResources: [remote()] });

      expect(registry.servesResource(REMOTE_RESOURCE)).toBe(false);
      expect(registry.resources).toEqual([`${BASE_URL}/mcp/community-doc`]);
    });
  });

  describe('isKnownResource', () => {
    it('recognizes a resource served here', () => {
      expect(buildRegistry().isKnownResource(`${BASE_URL}/mcp/community-doc`)).toBe(true);
    });

    it('recognizes a remote resource this application issues tokens for', () => {
      // Per ADR-0001 one Authorization Server answers for every application: a client
      // discovering another application's Resource is sent here for the token, and
      // `/authorize` refuses a `resource` this returns false for.
      expect(buildRegistry({ remoteResources: [remote()] }).isKnownResource(REMOTE_RESOURCE)).toBe(true);
    });

    it('normalizes a trailing slash on a remote URL, as it does on a served one', () => {
      const registry = buildRegistry({ remoteResources: [remote({ url: `${REMOTE_RESOURCE}/` })] });

      expect(registry.isKnownResource(REMOTE_RESOURCE)).toBe(true);
    });

    it('refuses a resource neither served nor issued for', () => {
      const registry = buildRegistry({ remoteResources: [remote()] });

      expect(registry.isKnownResource(`${REMOTE_BASE_URL}/mcp/other`)).toBe(false);
      expect(registry.isKnownResource(`${BASE_URL}/mcp/space`)).toBe(false);
    });

    it('refuses everything when no remote resource is configured at all', () => {
      // The field is optional, and its absence must read as an empty list rather than
      // throwing while Nest builds the injector.
      expect(buildRegistry().isKnownResource(REMOTE_RESOURCE)).toBe(false);
    });
  });

  describe('describeResource', () => {
    it('describes a registered resource in the words the user is shown', () => {
      const registry = buildRegistry({
        resources: [
          resource('mcp/community-doc', {
            name: 'The Constellab documentation',
            description: 'Search and read the public documentation',
          }),
        ],
      });

      expect(registry.describeResource(`${BASE_URL}/mcp/community-doc`)).toEqual({
        url: `${BASE_URL}/mcp/community-doc`,
        name: 'The Constellab documentation',
        description: 'Search and read the public documentation',
      });
    });

    it('describes the resource of an empty path, which is the application itself', () => {
      const registry = buildRegistry({ resources: [resource('', { name: 'Your account' })] });

      expect(registry.describeResource(BASE_URL)?.name).toBe('Your account');
    });

    it('answers null for a resource it does not serve', () => {
      // The consent screen turns this into a refusal rather than a bare URL: approving a
      // description nobody can give is not consent.
      expect(buildRegistry().describeResource(`${BASE_URL}/mcp/space`)).toBeNull();
    });

    it('describes a remote resource in the words the issuing application was given', () => {
      // The consent screen is served by the Authorization Server, so a Resource it mints for
      // has to be describable here even though nothing about it is served here.
      const registry = buildRegistry({
        remoteResources: [remote({ name: 'The Constellab documentation', description: 'Read the docs' })],
      });

      expect(registry.describeResource(REMOTE_RESOURCE)).toEqual({
        url: REMOTE_RESOURCE,
        name: 'The Constellab documentation',
        description: 'Read the docs',
      });
    });

    it('describes exactly what isKnownResource recognizes, and nothing else', () => {
      // The two answers coming apart is the failure that matters: a Resource a token can be
      // minted for but not described stops the flow with a 500 at the consent screen, which
      // is what the remote list was one edit away from causing.
      const registry = buildRegistry({
        resources: [resource('mcp/community-doc'), resource('')],
        remoteResources: [remote()],
      });

      for (const url of [
        `${BASE_URL}/mcp/community-doc`,
        BASE_URL,
        `${BASE_URL}/mcp`,
        AUTH_SERVER_URL,
        REMOTE_RESOURCE,
        `${REMOTE_BASE_URL}/mcp/other`,
      ]) {
        expect(registry.describeResource(url) != null).toBe(registry.isKnownResource(url));
      }
    });
  });

  describe('the authorization server', () => {
    it('is whatever the mounting application named, not this application', () => {
      // The one value that changes when token issuance moves to the Space API.
      expect(buildRegistry().authorizationServerUrl).toBe(AUTH_SERVER_URL);
    });

    it('is normalized like the base URL', () => {
      expect(buildRegistry({ authorizationServerUrl: `${AUTH_SERVER_URL}/` }).authorizationServerUrl).toBe(
        AUTH_SERVER_URL
      );
    });
  });

  describe('primaryResource', () => {
    it('is the first registered resource, which the pathless document answers for', () => {
      const registry = buildRegistry({ resources: [resource('mcp/community-doc'), resource('mcp/space')] });

      expect(registry.primaryResource).toBe(`${BASE_URL}/mcp/community-doc`);
    });

    it('is null when the application registers no resource at all', () => {
      expect(buildRegistry({ resources: [] }).primaryResource).toBeNull();
    });

    it('never answers with a remote resource', () => {
      // It answers a discovery document served from this host. Naming a Resource served
      // elsewhere would send a client to ask this server's audience for another host's URL.
      const registry = buildRegistry({ resources: [], remoteResources: [remote()] });

      expect(registry.primaryResource).toBeNull();
    });
  });
});
