import { HnOAuthClientStore } from './hn-oauth-client.store';

describe('HnOAuthClientStore', () => {
  let store: HnOAuthClientStore;
  const callbackUri = 'http://example.com/callback';

  beforeEach(() => {
    store = new HnOAuthClientStore();
  });

  it('registers a client and finds it back by id', () => {
    const client = store.register({
      redirect_uris: [callbackUri],
      client_name: 'Claude',
    });
    expect(client.client_id).toBeTruthy();
    expect(store.find(client.client_id)).toEqual(client);
  });

  it('issues distinct client ids', () => {
    const a = store.register({ redirect_uris: [callbackUri] });
    const b = store.register({ redirect_uris: [callbackUri] });
    expect(a.client_id).not.toBe(b.client_id);
  });

  it('returns null for an unknown client', () => {
    expect(store.find('does-not-exist')).toBeNull();
  });

  it('allows only exactly-registered redirect uris', () => {
    const client = store.register({ redirect_uris: [callbackUri] });
    expect(store.redirectUriAllowed(client, callbackUri)).toBe(true);
    // exact match: a trailing slash or a different host is rejected (anti open-redirect)
    expect(store.redirectUriAllowed(client, `${callbackUri}/`)).toBe(false);
    expect(store.redirectUriAllowed(client, 'http://evil.example/callback')).toBe(false);
  });

  it('supports multiple registered redirect uris', () => {
    const client = store.register({
      redirect_uris: [callbackUri, 'http://another-example.com/callback'],
    });
    expect(store.redirectUriAllowed(client, 'http://another-example.com/callback')).toBe(true);
  });
});
