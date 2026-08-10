import { BlOAuthConsentStore, BlOAuthPendingAuthorization } from './bl-oauth-consent.store';
import { BlOAuthRedisMock } from './bl-oauth-redis.mock';

const pending: BlOAuthPendingAuthorization = {
  clientId: 'client-1',
  redirectUri: 'https://claude.ai/api/mcp/auth_callback',
  codeChallenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
  resources: ['https://api.example.com/mcp/community-doc'],
  state: 'the-state',
  user: { id: 'user-1', email: 'user@example.com' },
};

const TEN_MINUTES_AND_A_BIT = 10 * 60 * 1000 + 1000;
const TWO_MINUTES_AND_A_BIT = 2 * 60 * 1000 + 1000;

function buildStore(): { store: BlOAuthConsentStore; redis: BlOAuthRedisMock } {
  const redis = new BlOAuthRedisMock();
  return { store: new BlOAuthConsentStore(redis), redis };
}

describe('BlOAuthConsentStore', () => {
  describe('pending authorizations', () => {
    it('parks a request and hands back the id the consent page is given', async () => {
      const { store } = buildStore();
      const consentId = await store.createPending(pending);

      expect(consentId).toMatch(/^[0-9a-f]{64}$/);
      await expect(store.findPending(consentId)).resolves.toEqual(pending);
    });

    it('issues distinct ids', async () => {
      const { store } = buildStore();
      const [first, second] = [await store.createPending(pending), await store.createPending(pending)];
      expect(first).not.toBe(second);
    });

    it('can be read as often as the page is loaded', async () => {
      const { store } = buildStore();
      const consentId = await store.createPending(pending);

      // Reading is describing, and describing grants nothing: a reload, or a login round
      // trip that re-enters the flow, must not consume the request.
      await expect(store.findPending(consentId)).resolves.toEqual(pending);
      await expect(store.findPending(consentId)).resolves.toEqual(pending);
    });

    it('can be decided only once', async () => {
      const { store } = buildStore();
      const consentId = await store.createPending(pending);

      await expect(store.consumePending(consentId)).resolves.toEqual(pending);
      // A reload of the decision URL, or a replayed history entry, must not produce a
      // second authorization code.
      await expect(store.consumePending(consentId)).resolves.toBeNull();
      await expect(store.findPending(consentId)).resolves.toBeNull();
    });

    it('answers null for an id it never issued', async () => {
      const { store } = buildStore();
      await expect(store.findPending('made-up')).resolves.toBeNull();
      await expect(store.consumePending('made-up')).resolves.toBeNull();
    });

    it('expires an abandoned request, which is what makes closing the page safe', async () => {
      jest.useFakeTimers();
      try {
        const { store, redis } = buildStore();
        const consentId = await store.createPending(pending);
        expect(redis.size()).toBe(1);

        jest.advanceTimersByTime(TEN_MINUTES_AND_A_BIT);

        await expect(store.findPending(consentId)).resolves.toBeNull();
      } finally {
        jest.useRealTimers();
      }
    });

    it('outlives a login round trip, which the consent page has to survive', async () => {
      jest.useFakeTimers();
      try {
        const { store } = buildStore();
        const consentId = await store.createPending(pending);

        // A session dying under the page sends the user through login and back. A request
        // that expired in the meantime abandons a client that is still waiting.
        jest.advanceTimersByTime(4 * 60 * 1000);

        await expect(store.findPending(consentId)).resolves.toEqual(pending);
      } finally {
        jest.useRealTimers();
      }
    });

    it('treats a corrupt entry as absent instead of throwing', async () => {
      const { store, redis } = buildStore();
      const consentId = await store.createPending(pending);
      redis.corrupt(consentId);

      await expect(store.findPending(consentId)).resolves.toBeNull();
      await expect(store.consumePending(consentId)).resolves.toBeNull();
    });
  });

  describe('decision tokens', () => {
    const binding = { consentId: 'pending-42', userId: 'user-1' };

    it('mints a token carrying what it authorizes', async () => {
      const { store } = buildStore();
      const token = await store.issueDecisionToken(binding);

      expect(token).toMatch(/^[0-9a-f]{64}$/);
      await expect(store.consumeDecisionToken(token)).resolves.toEqual(binding);
    });

    it('issues distinct tokens', async () => {
      const { store } = buildStore();
      const [first, second] = [
        await store.issueDecisionToken(binding),
        await store.issueDecisionToken(binding),
      ];
      expect(first).not.toBe(second);
    });

    it('can be spent once, so it cannot be replayed out of a browser history', async () => {
      const { store } = buildStore();
      const token = await store.issueDecisionToken(binding);

      await expect(store.consumeDecisionToken(token)).resolves.toEqual(binding);
      await expect(store.consumeDecisionToken(token)).resolves.toBeNull();
    });

    it('answers null for a token it never minted', async () => {
      const { store } = buildStore();
      await expect(store.consumeDecisionToken('made-up')).resolves.toBeNull();
    });

    it('expires shortly, since it only has to cover one click', async () => {
      jest.useFakeTimers();
      try {
        const { store } = buildStore();
        const token = await store.issueDecisionToken(binding);

        jest.advanceTimersByTime(TWO_MINUTES_AND_A_BIT);

        await expect(store.consumeDecisionToken(token)).resolves.toBeNull();
      } finally {
        jest.useRealTimers();
      }
    });

    it('treats a corrupt entry as absent instead of throwing', async () => {
      const { store, redis } = buildStore();
      const token = await store.issueDecisionToken(binding);
      redis.corrupt(token);

      await expect(store.consumeDecisionToken(token)).resolves.toBeNull();
    });
  });
});
