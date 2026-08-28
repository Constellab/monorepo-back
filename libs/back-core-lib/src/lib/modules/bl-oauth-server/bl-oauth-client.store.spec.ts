import { Logger } from '@nestjs/common';

import { BlOAuthClientStore } from './bl-oauth-client.store';
import { BlOAuthRedisMock } from './bl-oauth-redis.mock';

describe('BlOAuthClientStore', () => {
  let store: BlOAuthClientStore;
  let redis: BlOAuthRedisMock;
  const callbackUri = 'http://example.com/callback';

  /**
   * `blParseStoredJson` says a corrupt entry out loud once, on purpose. Stubbed so a green
   * run stays quiet, and asserted below rather than dropped: absent and corrupt are the
   * same answer to the caller, so this line is the only place the difference survives.
   */
  let loggedWarnings: jest.SpyInstance;

  beforeEach(() => {
    redis = new BlOAuthRedisMock();
    store = new BlOAuthClientStore(redis);
    loggedWarnings = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('registers a client and finds it back by id', async () => {
    const client = await store.register({
      redirect_uris: [callbackUri],
      client_name: 'Claude',
    });
    expect(client.client_id).toBeTruthy();
    await expect(store.find(client.client_id)).resolves.toEqual(client);
  });

  it('issues distinct client ids', async () => {
    const a = await store.register({ redirect_uris: [callbackUri] });
    const b = await store.register({ redirect_uris: [callbackUri] });
    expect(a.client_id).not.toBe(b.client_id);
  });

  it('returns null for an unknown client', async () => {
    await expect(store.find('does-not-exist')).resolves.toBeNull();
  });

  it('bounds the client name it keeps', async () => {
    const client = await store.register({
      redirect_uris: [callbackUri],
      client_name: 'x'.repeat(500),
    });

    // Registration is public and unauthenticated, and this string is kept for 30 days —
    // unbounded, it is somewhere to park arbitrary attacker-supplied text.
    expect(client.client_name).toHaveLength(200);
    await expect(store.find(client.client_id)).resolves.toEqual(client);
  });

  it('allows only exactly-registered redirect uris', async () => {
    const client = await store.register({ redirect_uris: [callbackUri] });
    expect(store.redirectUriAllowed(client, callbackUri)).toBe(true);
    // exact match: a trailing slash or a different host is rejected (anti open-redirect)
    expect(store.redirectUriAllowed(client, `${callbackUri}/`)).toBe(false);
    expect(store.redirectUriAllowed(client, 'http://evil.example/callback')).toBe(false);
  });

  it('supports multiple registered redirect uris', async () => {
    const client = await store.register({
      redirect_uris: [callbackUri, 'http://another-example.com/callback'],
    });
    expect(store.redirectUriAllowed(client, 'http://another-example.com/callback')).toBe(true);
  });

  it('keeps a registration readable across lookups (not consumed)', async () => {
    const client = await store.register({ redirect_uris: [callbackUri] });
    await expect(store.find(client.client_id)).resolves.toEqual(client);
    await expect(store.find(client.client_id)).resolves.toEqual(client);
  });

  it('expires a registration after its TTL', async () => {
    jest.useFakeTimers();
    try {
      const client = await store.register({ redirect_uris: [callbackUri] });
      jest.advanceTimersByTime(31 * 24 * 60 * 60 * 1000);
      await expect(store.find(client.client_id)).resolves.toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  it('treats a corrupt entry as unknown instead of throwing', async () => {
    const client = await store.register({ redirect_uris: [callbackUri] });
    redis.corrupt(client.client_id);
    await expect(store.find(client.client_id)).resolves.toBeNull();

    expect(loggedWarnings).toHaveBeenCalledWith(expect.stringContaining('client entry'));
  });
});
