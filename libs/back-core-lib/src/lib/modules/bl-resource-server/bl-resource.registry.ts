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
 *
 * Two lists, because an Authorization Server serving one application and issuing for
 * several needs both answers: what is served here ({@link servesResource}) and what a token
 * may be minted for ({@link isKnownResource}). Only the first is protected and published.
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

  /** Every Resource identifier this application serves. */
  get resources(): string[] {
    return this.config.resources.map((resource) => this.resourceUrl(resource.path));
  }

  /**
   * The Resources of other applications this one may mint tokens for, as absolute URLs.
   *
   * Normalized like the served ones, and only that: the URL is compared verbatim against
   * what a client asks for, so anything else normalized here would accept an audience the
   * serving application never advertised.
   */
  get remoteResources(): string[] {
    return (this.config.remoteResources ?? []).map((resource) => blStripTrailingSlashes(resource.url));
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
   * Whether an absolute URL is one of the Resources this application *serves*.
   *
   * The question the Resource Server half asks: what may be protected here, and what has a
   * discovery document here. A remote Resource answers false — it is served elsewhere, and a
   * token for it must not be accepted on this host however plainly it was minted here.
   *
   * The identifier is compared verbatim: it is what a token's `aud` has to match, and a
   * comparison that normalized more than the trailing slash already normalized at
   * registration would accept an audience no document ever advertised.
   */
  servesResource(resource: string): boolean {
    return this.resources.includes(resource);
  }

  /**
   * Whether a token may be minted for an absolute URL — served here or served by an
   * application this one is the Authorization Server for.
   *
   * Wider than {@link servesResource} on purpose, and this is the distinction: issuing a
   * token and honouring one are two different rights. Per ADR-0001 the Space API mints for
   * every application; each application still accepts only its own.
   */
  isKnownResource(resource: string): boolean {
    return this.servesResource(resource) || this.remoteResources.includes(resource);
  }

  /**
   * How to describe a Resource to a user being asked to approve access to it, or null
   * when the URL names no Resource this application knows of.
   *
   * Spans exactly what {@link isKnownResource} spans, remote entries included, so the set
   * of Resources a token can be minted for and the set that can be described to a user
   * cannot come apart — a Resource that cannot be described is one the consent screen
   * would have to ask a blind approval for.
   */
  describeResource(resource: string): BlResourceDescription | null {
    const served = this.config.resources.find((entry) => this.resourceUrl(entry.path) === resource);
    if (served != null) {
      return { url: resource, name: served.name, description: served.description };
    }

    const remote = (this.config.remoteResources ?? []).find(
      (entry) => blStripTrailingSlashes(entry.url) === resource
    );
    if (remote == null) {
      return null;
    }
    return { url: resource, name: remote.name, description: remote.description };
  }
}
