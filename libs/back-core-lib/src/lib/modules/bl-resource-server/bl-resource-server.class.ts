export const BL_RESOURCE_SERVER_CONFIG_PROVIDER = Symbol();

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
   * Paths of the protected surfaces this application serves, relative to {@link baseUrl},
   * with or without a leading slash.
   *
   * A Resource is any protected surface identified by its URL (ADR-0002), not
   * specifically an MCP endpoint: an application registering its whole API registers the
   * empty path, which names {@link baseUrl} itself.
   *
   * Order is meaningful only in that the first entry answers the pathless discovery
   * document.
   */
  resourcePaths: string[];
}
