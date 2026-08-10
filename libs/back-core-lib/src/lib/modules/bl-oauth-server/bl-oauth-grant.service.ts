import { ClDateHelper } from '@monorepo/core-lib';
import { Logger } from '@nestjs/common';
import { DeepPartial, In, Repository } from 'typeorm';

import { BlOAuthGrantEntity } from './bl-oauth-grant.entity';

/**
 * The application's own Grant service, as the shared Authorization Server reaches it.
 *
 * An alias rather than the class itself, for the same reason
 * `BL_REFRESH_TOKEN_SERVICE_PROVIDER` is one: each application binds its own subclass over
 * its own table, so there is no single class token the library could depend on.
 */
export const BL_OAUTH_GRANT_SERVICE_PROVIDER = Symbol();

/** All the Grant service needs of the approving user: the id it writes into the foreign key. */
export interface BlOAuthGrantOwner {
  id: string;
}

/**
 * Record, read back and end Grants.
 *
 * A Grant is what the consent screen produces: it says this user approved this client for
 * this Resource, and it is the only reason a later authorization request may skip the
 * screen. Nothing here mints anything — a Grant is an approval, not a credential.
 *
 * Application-agnostic: it is handed a repository over a subclass of
 * {@link BlOAuthGrantEntity} and knows nothing else about the application it serves.
 *
 * Not `@Injectable` itself: an application subclasses it to bind its own repository, which
 * is also what makes the foreign key point at its own user table.
 */
export class BlOAuthGrantService<TUser extends BlOAuthGrantOwner = BlOAuthGrantOwner> {
  private readonly logger = new Logger(BlOAuthGrantService.name);

  constructor(protected readonly repository: Repository<BlOAuthGrantEntity<TUser>>) {}

  /**
   * Record the user's approval of one client for several Resources — one Grant per
   * Resource, which is what lets one pass through the consent screen cover a whole
   * connection without ever producing a Grant that spans two Resources.
   */
  async approve(user: BlOAuthGrantOwner, clientId: string, resources: string[]): Promise<void> {
    for (const resource of resources) {
      await this.approveOne(user, clientId, resource);
    }
  }

  /**
   * Whether every Resource asked for is already approved for this client — the one
   * question `/authorize` asks before deciding whether the user has to be shown anything.
   *
   * Every, not any: a request naming one approved Resource and one new one is a request
   * for something the user has not seen, so it goes through the screen. An empty list is
   * not "everything is approved" — it is a request that never named a Resource, which the
   * validation has already rejected.
   */
  async areAllGranted(userId: string, clientId: string, resources: string[]): Promise<boolean> {
    if (resources.length === 0) {
      return false;
    }

    // One query for the whole list, and counted against the *deduplicated* keys: this runs on
    // every authorization request, and a per-Resource round trip would put the database in the
    // path once per Resource for a question that is one lookup.
    const grantKeys = new Set(
      resources.map((resource) => BlOAuthGrantEntity.buildGrantKey(userId, clientId, resource))
    );
    return (await this.repository.countBy({ grantKey: In([...grantKeys]) })) === grantKeys.size;
  }

  /** Whether this user has approved this client for this one Resource. */
  async isGranted(userId: string, clientId: string, resource: string): Promise<boolean> {
    const grantKey = BlOAuthGrantEntity.buildGrantKey(userId, clientId, resource);
    return (await this.repository.countBy({ grantKey })) > 0;
  }

  /**
   * End a Grant, so the next authorization request goes through the consent screen again.
   *
   * Called when a client revokes its own access: a machine the user has dismissed must not
   * be able to walk straight back in on an approval they believe they took back. The
   * refresh token is what stops working immediately; this is what stops it from being
   * silently reissued.
   */
  async revoke(userId: string, clientId: string, resource: string): Promise<void> {
    await this.repository.delete({ grantKey: BlOAuthGrantEntity.buildGrantKey(userId, clientId, resource) });
  }

  /**
   * Record one approval, or refresh the one already there.
   *
   * Whether the row exists is asked outright rather than inferred from how many rows an
   * `UPDATE` touched: MySQL reports rows *changed*, not rows matched, so approving twice
   * within the same second writes the same `approvedAt` and reports nothing affected — which
   * is indistinguishable from "no such row" and would send an ordinary re-approval down the
   * insert path.
   *
   * The insert is still guarded, because asking and writing cannot be one statement: the
   * unique index on `grantKey` is what stops two approvals racing from both creating a row,
   * and the loser refreshes the winner's instead. There is only ever one row per triple, so
   * the two of them are agreeing rather than competing.
   */
  private async approveOne(user: BlOAuthGrantOwner, clientId: string, resource: string): Promise<void> {
    const grantKey = BlOAuthGrantEntity.buildGrantKey(user.id, clientId, resource);
    const approvedAt = ClDateHelper.getDate();

    if ((await this.repository.countBy({ grantKey })) > 0) {
      await this.repository.update({ grantKey }, { approvedAt });
      return;
    }

    try {
      await this.repository.save(
        this.repository.create({
          grantKey,
          clientId,
          resource,
          // Asserted on this one property rather than on the whole literal, so every other
          // column stays type-checked: the relation is the subclass' own shape, and all
          // TypeORM needs of it here is the `id` it writes into the foreign key.
          user: user as DeepPartial<TUser>,
          approvedAt,
        })
      );
    } catch (error) {
      if ((error as { code?: string })?.code !== 'ER_DUP_ENTRY') {
        throw error;
      }
      // A concurrent approval of the same triple got there first. Genuinely concurrent, now
      // that a same-second re-approval no longer reaches this path.
      this.logger.warn(`Concurrent approval of the same Grant for client '${clientId}'; refreshing it`);
      await this.repository.update({ grantKey }, { approvedAt });
    }
  }
}
