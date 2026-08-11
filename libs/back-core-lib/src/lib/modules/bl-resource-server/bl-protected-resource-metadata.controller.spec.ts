import { NotFoundException } from '@nestjs/common';
import { Request } from 'express';

import { BlProtectedResourceMetadataController } from './bl-protected-resource-metadata.controller';
import { BlResourceRegistry } from './bl-resource.registry';
import { BlResourceServerConfig } from './bl-resource-server.class';

const BASE_URL = 'https://community.example.com';
const AUTH_SERVER_URL = 'https://api.example.com';
const RESOURCE_PATH = '/mcp/community-doc';
const RESOURCE = `${BASE_URL}${RESOURCE_PATH}`;
const WELL_KNOWN = '/.well-known/oauth-protected-resource';

function buildController(
  overrides: Partial<BlResourceServerConfig> = {}
): BlProtectedResourceMetadataController {
  const registry = new BlResourceRegistry({
    baseUrl: BASE_URL,
    authorizationServerUrl: AUTH_SERVER_URL,
    resources: [{ path: RESOURCE_PATH, name: 'The documentation' }],
    ...overrides,
  });
  return new BlProtectedResourceMetadataController(registry);
}

/** A GET on a `.well-known` path, as Express hands it to the controller. */
const requestFor = (path: string): Request => ({ path }) as unknown as Request;

describe('BlProtectedResourceMetadataController', () => {
  it('serves the document for the resource named in the path', () => {
    const metadata = buildController().getProtectedResourceMetadataForPath(
      requestFor(`${WELL_KNOWN}${RESOURCE_PATH}`)
    );

    expect(metadata.resource).toBe(RESOURCE);
  });

  it('names the configured authorization server rather than this application', () => {
    // What makes the Community mountable as a Resource Server for a server it does not
    // host: the document has to send a client somewhere else entirely.
    const metadata = buildController().getProtectedResourceMetadataForPath(
      requestFor(`${WELL_KNOWN}${RESOURCE_PATH}`)
    );

    expect(metadata.authorization_servers).toEqual([AUTH_SERVER_URL]);
  });

  it('404s on a path that is not a registered resource', () => {
    // Answering with the primary resource here would tell a client calling one surface
    // to request an audience for a different one.
    expect(() =>
      buildController().getProtectedResourceMetadataForPath(requestFor(`${WELL_KNOWN}/mcp/space-doc`))
    ).toThrow(NotFoundException);
  });

  it('404s rather than treating a non-metadata path as a resource', () => {
    expect(() => buildController().getProtectedResourceMetadataForPath(requestFor(RESOURCE_PATH))).toThrow(
      NotFoundException
    );
  });

  it('404s for a resource this application only issues tokens for', () => {
    // Its document lives on the host that serves it, and only that host can say which
    // authorization server protects it. Publishing one here would be this application
    // answering discovery on another's behalf.
    const controller = buildController({
      remoteResources: [{ url: `${BASE_URL}/mcp/elsewhere`, name: 'Another application' }],
    });

    expect(() =>
      controller.getProtectedResourceMetadataForPath(requestFor(`${WELL_KNOWN}/mcp/elsewhere`))
    ).toThrow(NotFoundException);
  });

  it('serves a resource that is not an MCP endpoint', () => {
    // ADR-0002: a Resource is any protected surface identified by its URL.
    const metadata = buildController({
      resources: [{ path: '/v1/documents', name: 'The documents API' }],
    }).getProtectedResourceMetadataForPath(requestFor(`${WELL_KNOWN}/v1/documents`));

    expect(metadata.resource).toBe(`${BASE_URL}/v1/documents`);
  });

  describe('the pathless document', () => {
    it('keeps answering for the primary resource, which older clients ask for', () => {
      // A discovery document that 404s makes a client abandon the whole flow, so this
      // form stays even though RFC 9728 only defines the per-resource one.
      expect(buildController().getProtectedResourceMetadata().resource).toBe(RESOURCE);
    });

    it('answers for the application itself when that is a registered resource', () => {
      // This URL is where RFC 9728 puts the document of the empty-path Resource, so once
      // an application registers its whole API this is its document — not a compatibility
      // answer naming some other Resource. That is the same rule as everywhere else: the
      // document a refusal points at names the Resource actually called.
      const controller = buildController({
        resources: [
          { path: RESOURCE_PATH, name: 'The documentation' },
          { path: '', name: 'The whole API' },
        ],
      });

      expect(controller.getProtectedResourceMetadata().resource).toBe(BASE_URL);
    });

    it('404s when the application registers no resource', () => {
      expect(() => buildController({ resources: [] }).getProtectedResourceMetadata()).toThrow(
        NotFoundException
      );
    });
  });
});
