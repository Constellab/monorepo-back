import { Inject, Injectable } from '@nestjs/common';

import { blStripTrailingSlashes } from '../bl-oauth/bl-oauth-url.util';
import {
  BL_RESOURCE_SERVER_CONFIG_PROVIDER,
  BlResourceDescription,
  BlResourceLookup,
  BlResourceServerConfig,
} from './bl-resource-server.class';

/**
 * The Resources this application serves, as absolute URLs.
 *
 * One place turns a configured path into a resource identifier, so the audience a token
 * must carry, the URL a client calls and the discovery document served for it are the
 * same string by construction rather than by three sites agreeing.
 *
 * A Resource is any protected surface identified by its URL (ADR-0002) — nothing here
 * knows what is mounted at one. An MCP endpoint and a whole API are the same kind of
 * entry, which is what lets the CLI work register APIs without reworking this.
 */
@Injectable()
export class BlResourceRegistry implements BlResourceLookup {
  constructor(@Inject(BL_RESOURCE_SERVER_CONFIG_PROVIDER) private readonly config: BlResourceServerConfig) {}

  /** Public base URL of this application (no trailing slash). */
  get baseUrl(): string {
    return blStripTrailingSlashes(this.config.baseUrl);
  }

  /** Base URL of the Authorization Server the discovery documents point clients at. */
  get authorizationServerUrl(): string {
    return blStripTrailingSlashes(this.config.authorizationServerUrl);
  }

  /** Every registered Resource identifier. */
  get resources(): string[] {
    return this.config.resources.map((resource) => this.resourceUrl(resource.path));
  }

  /**
   * The Resource the pathless discovery document answers for, or null when the
   * application registers none.
   *
   * RFC 9728 only defines the per-resource document; this one exists for clients that
   * predate the split, and answering with the first registered Resource is the behaviour
   * they were written against.
   */
  get primaryResource(): string | null {
    return this.resources[0] ?? null;
  }

  /**
   * Resource identifier for a path relative to {@link baseUrl}.
   *
   * The empty path names the base URL itself — an application that is its own Resource.
   */
  resourceUrl(resourcePath: string): string {
    const path = blStripTrailingSlashes(resourcePath);
    if (path.length === 0) {
      return this.baseUrl;
    }
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  /**
   * Whether an absolute URL is one of the Resources served here.
   *
   * The identifier is compared verbatim: it is what a token's `aud` has to match, and a
   * comparison that normalized more than the trailing slash already normalized at
   * registration would accept an audience no document ever advertised.
   */
  isKnownResource(resource: string): boolean {
    return this.resources.includes(resource);
  }

  /**
   * How to describe a Resource to a user being asked to approve access to it, or null
   * when the URL names no Resource served here.
   *
   * Matched with {@link isKnownResource} rather than with its own comparison, so the set
   * of Resources a token can be minted for and the set that can be described to a user
   * cannot come apart — a Resource that cannot be described is one the consent screen
   * would have to ask a blind approval for.
   */
  describeResource(resource: string): BlResourceDescription | null {
    const definition = this.config.resources.find((entry) => this.resourceUrl(entry.path) === resource);
    if (definition == null) {
      return null;
    }
    return {
      url: resource,
      name: definition.name,
      description: definition.description,
    };
  }
}
