import { ClDateHelper } from '@monorepo/core-lib';
import { createHash, randomBytes } from 'crypto';
import { DateTime } from 'luxon';
import { DeepPartial, FindOptionsRelations, LessThan, Repository } from 'typeorm';

import { BlRefreshTokenEntity, BlRefreshTokenKind } from './bl-refresh-token.entity';

/** OAuth-only binding carried by the token, replayed when the access token is renewed. */
export interface BlRefreshTokenOAuthBinding {
  clientId: string;
  resource: string;
}

/**
 * All `issue` needs of the session owner: the id it writes into the foreign key.
 *
 * Narrow on purpose — the OAuth flow only knows the user through the authorization
 * code binding (`{ id, email }`), and requiring a full user entity there would mean an
 * extra query, or making the OAuth module depend on the user module, for a column it
 * never reads.
 */
export interface BlRefreshTokenOwner {
  id: string;
}

/** What a successful rotation yields: the new token, plus everything needed to mint an access token. */
export interface BlRefreshTokenRotation<TUser> {
  token: string;
  user: TUser;
  clientId: string | null;
  resource: string | null;
}

/**
 * Issue, rotate and revoke refresh tokens.
 *
 * Application-agnostic: it is handed a repository over a subclass of
 * `BlRefreshTokenEntity` and a lifetime, and knows nothing else about the application
 * it serves. `TUser` is only ever carried through — loaded on a rotation and handed
 * back to the caller, never inspected.
 *
 * Not `@Injectable` itself: an application subclasses it to bind its own repository
 * and its own configured lifetime, which is also what gives its callers a `user` typed
 * as their own user entity.
 */
export class BlRefreshTokenService<TUser extends BlRefreshTokenOwner = BlRefreshTokenOwner> {
  constructor(
    protected readonly repository: Repository<BlRefreshTokenEntity<TUser>>,
    /**
     * Read on every issue and every rotation rather than once, so a lifetime coming
     * from configuration is not frozen at construction.
     */
    protected readonly getRefreshTokenDurationInSeconds: () => number
  ) {}

  /**
   * Create a session and return its refresh token — the only moment
   * it exists in clear anywhere. Only its hash is persisted.
   */
  async issue(
    user: BlRefreshTokenOwner,
    kind: BlRefreshTokenKind,
    oauthBinding?: BlRefreshTokenOAuthBinding
  ): Promise<string> {
    const token = BlRefreshTokenService.generateToken();

    const entity = this.repository.create({
      tokenHash: BlRefreshTokenService.hash(token),
      // Nothing has been replaced yet — the chain starts here.
      previousTokenHash: null,
      kind,
      // Asserted on this one property rather than on the whole literal, so every other
      // column stays type-checked: the relation is the subclass' own shape, and all
      // TypeORM needs of it here is the `id` it writes into the foreign key.
      user: user as DeepPartial<TUser>,
      expiresAt: this.expiryFromNow(),
      clientId: oauthBinding?.clientId ?? null,
      resource: oauthBinding?.resource ?? null,
      createdAt: ClDateHelper.getDate(),
    });
    await this.repository.save(entity);

    return token;
  }

  /**
   * Consume a refresh token and replace it, atomically.
   *
   * Returns null when the token is unknown, expired, of the wrong kind, or already
   * consumed. All four are indistinguishable to the caller on purpose.
   *
   * A token already consumed additionally destroys the session it belonged to — see
   * `previousTokenHash`.
   */
  async rotate(
    presentedToken: string,
    kind: BlRefreshTokenKind
  ): Promise<BlRefreshTokenRotation<TUser> | null> {
    const presentedHash = BlRefreshTokenService.hash(presentedToken);

    // One query for both cases: the current token of a session, or the token its last
    // rotation consumed. Both columns are indexed, so the OR stays an index lookup.
    const existing = await this.repository.findOne({
      where: [
        { tokenHash: presentedHash, kind },
        { previousTokenHash: presentedHash, kind },
      ],
      // Asserted because `user` is a type parameter here: TypeORM's relation type is a
      // conditional on the property's shape, and a conditional on a naked type
      // parameter stays unresolved. The relation loaded is the subclass' own.
      relations: { user: true } as FindOptionsRelations<BlRefreshTokenEntity<TUser>>,
    });
    if (existing == null) {
      return null;
    }

    // Matched on the previous hash: this token was already exchanged, and someone is
    // presenting it a second time. OAuth 2.1 §4.14.2 — one of the two holders is a
    // thief and we cannot tell which, so the whole session goes, including the token
    // the legitimate holder may have. Expiry is not checked first: an expired row is
    // going away either way.
    if (existing.tokenHash !== presentedHash) {
      await this.repository.delete({ id: existing.id });
      return null;
    }

    if (existing.expiresAt < ClDateHelper.getDate()) {
      return null;
    }

    const newToken = BlRefreshTokenService.generateToken();
    // Guarded on the OLD hash, not on the id: the first UPDATE destroys the condition the
    // second one needs, which is what makes the token single-use under concurrency.
    const result = await this.repository.update(
      { tokenHash: presentedHash },
      {
        tokenHash: BlRefreshTokenService.hash(newToken),
        previousTokenHash: presentedHash,
        expiresAt: this.expiryFromNow(),
      }
    );

    // Zero rows means another request rotated this token first: reject rather than
    // hand out a second valid token for the same session.
    if (result.affected !== 1) {
      return null;
    }

    return {
      token: newToken,
      user: existing.user,
      clientId: existing.clientId,
      resource: existing.resource,
    };
  }

  /**
   * Revoke a session. Silent when the token is unknown — a logout carrying a stale
   * cookie should still succeed.
   */
  async revoke(presentedToken: string): Promise<void> {
    await this.repository.delete({ tokenHash: BlRefreshTokenService.hash(presentedToken) });
  }

  /**
   * Revoke an OAuth refresh token on behalf of the client it was issued to (RFC 7009).
   *
   * Scoped to `kind: 'oauth'` and to `clientId` so `/oauth/revoke`, which is
   * unauthenticated, cannot be used to destroy a browser session or a token belonging
   * to another client. Silent like `revoke`: RFC 7009 §2.2 requires 200 even for a
   * token that means nothing to us.
   *
   * Also matches on `previousTokenHash`, so a client that revokes the token it last
   * exchanged — because it kept the older copy, or because the rotation response was
   * lost — still ends its session instead of getting a silent no-op.
   */
  async revokeOAuthToken(presentedToken: string, clientId: string): Promise<void> {
    const presentedHash = BlRefreshTokenService.hash(presentedToken);
    await this.repository.delete([
      { tokenHash: presentedHash, kind: 'oauth', clientId },
      { previousTokenHash: presentedHash, kind: 'oauth', clientId },
    ]);
  }

  /** Drop expired rows. Used by the cron job. */
  async deleteExpired(): Promise<number> {
    const result = await this.repository.delete({ expiresAt: LessThan(ClDateHelper.getDate()) });
    return result.affected ?? 0;
  }

  private expiryFromNow(): DateTime {
    return ClDateHelper.getDate().plus({ seconds: this.getRefreshTokenDurationInSeconds() });
  }

  private static generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  /** SHA-256 hex, 64 characters — matches the column length. */
  private static hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
