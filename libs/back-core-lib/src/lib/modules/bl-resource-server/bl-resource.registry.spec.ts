import { BlResourceRegistry } from './bl-resource.registry';
import { BlResourceServerConfig } from './bl-resource-server.class';

const BASE_URL = 'https://community.example.com';
const AUTH_SERVER_URL = 'https://api.example.com';

function buildRegistry(overrides: Partial<BlResourceServerConfig> = {}): BlResourceRegistry {
  return new BlResourceRegistry({
    baseUrl: BASE_URL,
    authorizationServerUrl: AUTH_SERVER_URL,
    resourcePaths: ['mcp/community-doc'],
    ...overrides,
  });
}

describe('BlResourceRegistry', () => {
  describe('resource identifiers', () => {
    it('builds one absolute URL per configured path', () => {
      const registry = buildRegistry({ resourcePaths: ['mcp/community-doc', 'mcp/space'] });

      expect(registry.resources).toEqual([`${BASE_URL}/mcp/community-doc`, `${BASE_URL}/mcp/space`]);
    });

    it('accepts a path written with a leading slash, which names the same resource', () => {
      expect(buildRegistry({ resourcePaths: ['/mcp/community-doc'] }).resources).toEqual([
        `${BASE_URL}/mcp/community-doc`,
      ]);
    });

    it('normalizes trailing slashes on both the base URL and the path', () => {
      const registry = buildRegistry({
        baseUrl: `${BASE_URL}/`,
        resourcePaths: ['mcp/community-doc/'],
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
      const registry = buildRegistry({ resourcePaths: ['', 'v1/documents'] });

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
      const registry = buildRegistry({ resourcePaths: ['mcp/community-doc', 'mcp/space'] });

      expect(registry.primaryResource).toBe(`${BASE_URL}/mcp/community-doc`);
    });

    it('is null when the application registers no resource at all', () => {
      expect(buildRegistry({ resourcePaths: [] }).primaryResource).toBeNull();
    });
  });
});
