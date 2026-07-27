import { HnOAuthCodeBinding, HnOAuthCodeStore } from './hn-oauth-code.store';

const binding: HnOAuthCodeBinding = {
  clientId: 'client-1',
  redirectUri: 'http://localhost:8080/callback',
  codeChallenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
  resource: 'http://localhost:3333/mcp/community-doc',
  user: { id: 'user-1', email: 'user@example.com' },
};

describe('HnOAuthCodeStore', () => {
  it('consumes a code once and returns its binding', () => {
    const store = new HnOAuthCodeStore();
    const code = store.create(binding);
    expect(store.consume(code)).toEqual(binding);
  });

  it('rejects a second consume of the same code (one-time use)', () => {
    const store = new HnOAuthCodeStore();
    const code = store.create(binding);
    store.consume(code);
    expect(store.consume(code)).toBeNull();
  });

  it('rejects an unknown code', () => {
    expect(new HnOAuthCodeStore().consume('does-not-exist')).toBeNull();
  });

  it('rejects an expired code (TTL <= 60s)', () => {
    jest.useFakeTimers();
    try {
      const store = new HnOAuthCodeStore();
      const code = store.create(binding);
      jest.advanceTimersByTime(61_000);
      expect(store.consume(code)).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });
});
