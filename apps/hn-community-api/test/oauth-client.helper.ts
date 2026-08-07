import { createHash } from 'node:crypto';

// Namespace import, matching test-e2e-helper.class.ts: `esModuleInterop` is off, so a
// default import would compile but be undefined at runtime.
import * as supertest from 'supertest';

import { TEST_ADMIN_EMAIL } from './test-credentials';

/** The Session token cookie, as the browser carries it. */
export const OAUTH_TEST_ACCESS_COOKIE = 'Authorization';

/** One of `OAUTH_ALLOWED_REDIRECT_URIS` in hn-test.env. */
export const OAUTH_TEST_REDIRECT_URI = 'https://claude.ai/api/mcp/auth_callback';

/**
 * A real PKCE pair, so an exchange driven through here goes through the same check a client
 * faces rather than a stub of it.
 */
export const OAUTH_TEST_CODE_VERIFIER = 'v'.repeat(64);
export const OAUTH_TEST_CODE_CHALLENGE = createHash('sha256')
  .update(OAUTH_TEST_CODE_VERIFIER)
  .digest('base64url');

/** What a client holds after a completed flow. */
export interface OAuthTestTokenPair {
  clientId: string;
  accessToken: string;
  refreshToken: string;
}

/**
 * Drives the OAuth flow over HTTP the way a client does: register, log in, authorize,
 * exchange, renew.
 *
 * Shared by the two OAuth e2e suites, which approach the same endpoints from different
 * angles — one asserts what the token is signed with, the other the protocol around it. They
 * had one copy of this each, and a copy that drifts is a suite quietly testing a flow no
 * client runs.
 *
 * Everything here goes through the public HTTP surface. It reaches into no store and no
 * service, which is what lets it keep working when the internals move — as they just did.
 */
export class OAuthTestClient {
  constructor(
    private readonly server: () => supertest.Agent,
    /**
     * The Resource to request an audience for. Read from a discovery document by the suite
     * rather than rebuilt here: the audience and the URL a client calls have to be the same
     * string, and reading it is how a suite would notice if they stopped being.
     */
    private readonly resource: () => string
  ) {}

  /** The session cookie of a logged-in browser. */
  async sessionToken(): Promise<string> {
    const response = await this.server()
      .post('/auth/login')
      .send({ email: TEST_ADMIN_EMAIL, password: 'anything' })
      .expect(201);

    const cookies = response.headers['set-cookie'] as unknown as string[];
    const entry = cookies.find((cookie) => cookie.startsWith(`${OAUTH_TEST_ACCESS_COOKIE}=`)) ?? '';
    return entry.split(';')[0].substring(`${OAUTH_TEST_ACCESS_COOKIE}=`.length);
  }

  /** Register a public client, as an MCP client does on first connection. */
  async registerClient(): Promise<string> {
    const response = await this.server()
      .post('/oauth/register')
      .send({ redirect_uris: [OAUTH_TEST_REDIRECT_URI], client_name: 'e2e client' })
      .expect(201);
    return response.body.client_id as string;
  }

  /** A well-formed authorization request, which a suite can then break one field of. */
  authorizeQuery(clientId: string): Record<string, string> {
    return {
      client_id: clientId,
      redirect_uri: OAUTH_TEST_REDIRECT_URI,
      response_type: 'code',
      code_challenge: OAUTH_TEST_CODE_CHALLENGE,
      code_challenge_method: 'S256',
      resource: this.resource(),
      state: 'the-state',
    };
  }

  /** Drive `/authorize` as a logged-in browser and return the code it redirects with. */
  async authorizationCode(clientId: string): Promise<string> {
    const redirect = await this.server()
      .get('/oauth/authorize')
      .query(this.authorizeQuery(clientId))
      .set('Cookie', [`${OAUTH_TEST_ACCESS_COOKIE}=${await this.sessionToken()}`])
      .expect(302);

    const code = new URL(redirect.headers.location).searchParams.get('code');
    if (!code) {
      // Thrown rather than asserted: this file is not a spec, so it carries no jest globals
      // — `tsconfig.app.json` compiles it along with the rest of the app.
      throw new Error(`/authorize redirected without a code: ${redirect.headers.location}`);
    }
    return code;
  }

  /** The whole flow a client runs: register, authorize, exchange. */
  async completeAuthorizationFlow(): Promise<OAuthTestTokenPair> {
    const clientId = await this.registerClient();
    const code = await this.authorizationCode(clientId);

    const token = await this.server()
      .post('/oauth/token')
      .send({
        grant_type: 'authorization_code',
        code,
        redirect_uri: OAUTH_TEST_REDIRECT_URI,
        client_id: clientId,
        code_verifier: OAUTH_TEST_CODE_VERIFIER,
      })
      .expect(200);

    return {
      clientId,
      accessToken: token.body.access_token as string,
      refreshToken: token.body.refresh_token as string,
    };
  }

  /** Renew from a refresh token. Not asserted, so a suite can expect either outcome. */
  refresh(pair: { clientId: string; refreshToken: string }): supertest.Test {
    return this.server().post('/oauth/token').send({
      grant_type: 'refresh_token',
      refresh_token: pair.refreshToken,
      client_id: pair.clientId,
    });
  }
}
