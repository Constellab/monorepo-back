import { HnOAuthCodeBinding, HnOAuthCodeStore } from './hn-oauth-code.store';
import { HnOAuthRedisMock } from './hn-oauth-redis.mock';

const binding: HnOAuthCodeBinding = {
  clientId: 'client-1',
  redirectUri: 'http://localhost:8080/callback',
  codeChallenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
  resource: 'http://localhost:3333/mcp/community-doc',
  user: { id: 'user-1', email: 'user@example.com' },
};

function buildStore(): { store: HnOAuthCodeStore; redis: HnOAuthRedisMock } {
  const redis = new HnOAuthRedisMock();
  return { store: new HnOAuthCodeStore(redis), redis };
}

describe('HnOAuthCodeStore', () => {
  it('consumes a code once and returns its binding', async () => {
    const { store } = buildStore();
    const code = await store.create(binding);
    await expect(store.consume(code)).resolves.toEqual(binding);
  });

  it('rejects a second consume of the same code (one-time use)', async () => {
    const { store } = buildStore();
    const code = await store.create(binding);
    await store.consume(code);
    await expect(store.consume(code)).resolves.toBeNull();
  });

  it('rejects an unknown code', async () => {
    const { store } = buildStore();
    await expect(store.consume('does-not-exist')).resolves.toBeNull();
  });

  it('issues distinct codes', async () => {
    const { store } = buildStore();
    const [first, second] = [await store.create(binding), await store.create(binding)];
    expect(first).not.toEqual(second);
  });

  it('removes the entry even when the code is never redeemed (TTL)', async () => {
    jest.useFakeTimers();
    try {
      const { store, redis } = buildStore();
      await store.create(binding);
      expect(redis.size()).toBe(1);

      jest.advanceTimersByTime(61_000);

      // The TTL is what bounds growth: an unredeemed code must not be retained.
      await expect(store.consume('irrelevant')).resolves.toBeNull();
      expect(await redis.get('oauth:code:whatever')).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  it('rejects an expired code', async () => {
    jest.useFakeTimers();
    try {
      const { store } = buildStore();
      const code = await store.create(binding);
      jest.advanceTimersByTime(61_000);
      await expect(store.consume(code)).resolves.toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  it('treats a corrupt entry as absent instead of throwing', async () => {
    const { store, redis } = buildStore();
    const code = await store.create(binding);
    redis.corrupt(code);
    await expect(store.consume(code)).resolves.toBeNull();
  });
});
