import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

export interface HnOAuthClient {
  client_id: string;
  redirect_uris: string[];
  client_name?: string;
}

export interface HnOAuthClientRegistration {
  redirect_uris: string[];
  client_name?: string;
}

/**
 * In-memory registry of OAuth clients (RFC 7591 Dynamic Client Registration).
 *
 * Public clients only (PKCE, no secret). In-memory for v1 — a restart forgets
 * registrations, and MCP clients simply re-register. Persist in DB later.
 */
@Injectable()
export class HnOAuthClientStore {
  private readonly clients = new Map<string, HnOAuthClient>();

  register(registration: HnOAuthClientRegistration): HnOAuthClient {
    const client: HnOAuthClient = {
      client_id: randomBytes(16).toString('hex'),
      redirect_uris: registration.redirect_uris,
      client_name: registration.client_name,
    };
    this.clients.set(client.client_id, client);
    return client;
  }

  find(clientId: string): HnOAuthClient | null {
    return this.clients.get(clientId) ?? null;
  }

  /** Exact-match check against the client's registered redirect URIs (anti open-redirect). */
  redirectUriAllowed(client: HnOAuthClient, redirectUri: string): boolean {
    return client.redirect_uris.includes(redirectUri);
  }
}
