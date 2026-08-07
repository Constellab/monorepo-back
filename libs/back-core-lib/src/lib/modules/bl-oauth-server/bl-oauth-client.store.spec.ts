import { BlOAuthClientStore } from './bl-oauth-client.store';
import { BlOAuthRedisMock } from './bl-oauth-redis.mock';

describe('BlOAuthClientStore', () => {
  let store: BlOAuthClientStore;
  let redis: BlOAuthRedisMock;
  const callbackUri = 'http://example.com/callback';

  beforeEach(() => {
    redis = new BlOAuthRedisMock();
    store = new BlOAuthClientStore(redis);
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
  });
});
