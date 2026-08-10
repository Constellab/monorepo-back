export const BL_RESOURCE_SERVER_CONFIG_PROVIDER = Symbol('BL_RESOURCE_SERVER_CONFIG');

/**
 * A Resource as a user asked to approve access to it sees it: the identifier, and the
 * words describing what is being handed over.
 *
 * The consent screen renders these as given and hardcodes nothing about them, so a
 * Resource added here appears to users with no front-end deployment.
 */
export interface BlResourceDescription {
  /** The Resource identifier — an absolute URL, which is also the token audience. */
  url: string;
  /** What the user is being asked to hand over, in their words. */
  name: string;
  /** Optional sentence detailing what a client will be able to do there. */
  description?: string;
}

/**
 * The questions asked of the Resource registry from outside the Resource Server half —
 * in particular by an Authorization Server checking the `resource` a client asks a token
 * for against what is actually served, and describing it to the user who must approve it.
 *
 * Declared as the questions rather than the class so such a caller stays a pure function
 * with no Nest provider to stand up, and so the contract lives here, next to the registry
 * that answers it, rather than being restated by each application.
 */
export interface BlResourceLookup {
  isKnownResource(resource: string): boolean;
  /** How to describe a Resource to a user. Null for a Resource that is not served here. */
  describeResource(resource: string): BlResourceDescription | null;
}

/**
 * One protected surface, as the application serving it declares it.
 *
 * The name and description sit here, next to the path, rather than in the Authorization
 * Server's own configuration: the audience a token is minted for, the URL a client calls,
 * the discovery document served for it and the words a user approves are then one entry
 * rather than four sites agreeing.
 */
export interface BlResourceDefinition {
  /**
   * Path of the protected surface, relative to {@link BlResourceServerConfig.baseUrl},
   * with or without a leading slash.
   *
   * A Resource is any protected surface identified by its URL (ADR-0002), not
   * specifically an MCP endpoint: an application registering its whole API registers the
   * empty path, which names the base URL itself.
   */
  path: string;

  /**
   * What this Resource is, in the words shown to a user asked to approve access to it.
   *
   * Not optional: a Resource nobody can describe cannot be approved knowingly, and the
   * consent screen refuses to ask for a blind approval.
   */
  name: string;

  /** What a client will be able to do here, in one sentence. Shown under the name. */
  description?: string;
}

/**
 * What an application supplies to become a Resource Server.
 *
 * Unlike the Authorization Server, this half has two real consumers — both applications
 * mount it — so everything application-shaped is here rather than read from a service the
 * library would have to know about.
 */
export interface BlResourceServerConfig {
  /**
   * Public base URL of the application mounting this, no trailing slash required.
   *
   * Both the resource identifiers and the URLs of their discovery documents are derived
   * from it, which is what keeps a resource identifier byte-equal to the URL a client
   * actually calls.
   */
  baseUrl: string;

  /**
   * Base URL of the Authorization Server clients must go to for a token, named in every
   * discovery document this server publishes.
   *
   * Separate from {@link baseUrl} even while an application is both — that is exactly the
   * value that changes when token issuance moves to the Space API, and it changes here
   * alone.
   */
  authorizationServerUrl: string;

  /**
   * The protected surfaces this application serves.
   *
   * Order is meaningful only in that the first entry answers the pathless discovery
   * document.
   */
  resources: BlResourceDefinition[];
}
