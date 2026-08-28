import { createHash } from 'crypto';
import { DateTime } from 'luxon';
import { Column, Index } from 'typeorm';

import { BlLuxonDateTimeColumn } from '../../decorators/bl-luxon-column.decorator';
import { BlEntityWithId } from '../../models/bl-entity-with-id.entity';

/**
 * A Grant — one user's standing authorization for one client to reach one Resource —
 * minus the relation to the owning user.
 *
 * This row is what the consent screen creates and what a later authorization request
 * reads to know it must not ask again. It is deliberately *not* the refresh token row:
 * a refresh token is one live session of a Grant, rotates on every renewal, and is gone
 * the moment the client stops renewing, whereas the approval it was issued under is the
 * thing the user gave and only the user takes back.
 *
 * One Resource per row, never a list, which is the invariant the whole design rests on:
 * a renewal reads its audience from stored state, so a Grant that could name two
 * Resources would be a Grant that could be widened into the second one.
 *
 * Abstract because each application owns its own user record: a subclass adds `@Entity()`
 * and the one `@ManyToOne` relation, exactly as `BlRefreshTokenEntity` does.
 */
export abstract class BlOAuthGrantEntity<TUser> extends BlEntityWithId {
  /**
   * SHA-256 of the three things a Grant *is*, so "one Grant per user, client and
   * Resource" is a unique index rather than a rule every caller has to remember.
   *
   * A single hashed column rather than a composite index on the three columns below: the
   * Resource is a 512-character URL, and one column is also what keeps re-approval a
   * single indexed lookup. The columns are still stored in clear — they are what a human
   * reads, and what a query for "everything this user approved" filters on.
   */
  @Index({ unique: true })
  @Column({ length: 64 })
  grantKey!: string;

  /** The registered client the user approved. */
  @Column({ length: 64 })
  clientId!: string;

  /** The one Resource this Grant covers, as its absolute URL — also the token audience. */
  @Column({ length: 512 })
  resource!: string;

  /**
   * Who approved it.
   *
   * Declared by the application subclass, which is the only place that knows what a user
   * is. The shared code writes the foreign key and never looks inside.
   */
  abstract user: TUser;

  /**
   * When the user last approved this client for this Resource.
   *
   * Overwritten rather than duplicated when they approve again, which is what keeps a
   * second pass through the consent screen from accumulating a second Grant.
   */
  @BlLuxonDateTimeColumn()
  approvedAt!: DateTime;

  /**
   * The identity of a Grant, as {@link grantKey} stores it.
   *
   * Static and on the entity because it is read by the service on every lookup and
   * written by it on every approval, and the two must derive the value the same way — a
   * second copy of this expression is a Grant nobody can find again.
   */
  static buildGrantKey(userId: string, clientId: string, resource: string): string {
    // The separator is a character none of the three can contain: a user id is a uuid, a
    // client id is hex, and a resource is an absolute URL, so a value cannot be shifted
    // across a boundary to collide with another triple.
    return createHash('sha256').update(`${userId}\n${clientId}\n${resource}`).digest('hex');
  }
}
