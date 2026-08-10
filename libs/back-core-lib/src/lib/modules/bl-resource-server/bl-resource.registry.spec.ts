import { BlResourceRegistry } from './bl-resource.registry';
import { BlResourceDefinition, BlResourceServerConfig } from './bl-resource-server.class';

const BASE_URL = 'https://community.example.com';
const AUTH_SERVER_URL = 'https://api.example.com';

/** A Resource entry, when what is under test is the path rather than the words. */
function resource(path: string, overrides: Partial<BlResourceDefinition> = {}): BlResourceDefinition {
  return { path, name: 'The documentation', ...overrides };
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

  describe('isKnownResource', () => {
    it('recognizes a registered resource', () => {
      expect(buildRegistry().isKnownResource(`${BASE_URL}/mcp/community-doc`)).toBe(true);
    });

    it('refuses a resource on another host, however similar the path', () => {
      expect(buildRegistry().isKnownResource(`${AUTH_SERVER_URL}/mcp/community-doc`)).toBe(false);
    });

    it('refuses a path that is not registered', () => {
      expect(buildRegistry().isKnownResource(`${BASE_URL}/mcp/space`)).toBe(false);
    });

    it('refuses a prefix of a registered resource', () => {
      // Matching on a prefix would let `/mcp` accept tokens minted for `/mcp/community-doc`.
      expect(buildRegistry().isKnownResource(`${BASE_URL}/mcp`)).toBe(false);
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

    it('describes exactly what isKnownResource recognizes, and nothing else', () => {
      // The two answers coming apart is the failure that matters: a Resource a token can be
      // minted for but not described would reach a user as a blind approval.
      const registry = buildRegistry({ resources: [resource('mcp/community-doc'), resource('')] });

      for (const url of [`${BASE_URL}/mcp/community-doc`, BASE_URL, `${BASE_URL}/mcp`, AUTH_SERVER_URL]) {
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
  });
});
