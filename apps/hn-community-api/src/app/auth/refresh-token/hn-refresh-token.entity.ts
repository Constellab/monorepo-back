import { BlEntityWithId, BlLuxonDateTimeColumn } from '@monorepo/back-core-lib';
import { Exclude, Type } from 'class-transformer';
import { DateTime } from 'luxon';
import { Column, Entity, Index, ManyToOne } from 'typeorm';

import { HnUser } from '../../users/hn-user.entity';

/**
 * Which surface a refresh token belongs to.
 */
export type HnRefreshTokenKind = 'session' | 'oauth';

/**
 * A refresh token.
 *
 * The access token stays a self-contained JWT validated by signature alone, so it is
 * not stored anywhere; this row is what makes a session revocable. Deleting it means
 * the session can no longer be renewed — the access token in flight still works until
 * it expires, which is why its lifetime is short.
 */
@Entity('refresh_token')
export class HnRefreshToken extends BlEntityWithId {
  /**
   * SHA-256 of the token, never the token itself.
   * Lookups hash the presented value and compare.
   */
  @Exclude()
  @Index({ unique: true })
  @Column({ length: 64 })
  tokenHash!: string;

  /**
   * Hash of the token this row replaced, i.e. the one consumed by the last rotation.
   *
   * Exists only to attribute a replay to its session. The rotation overwrites
   * `tokenHash`, so without this a consumed token becomes unrecognizable and the best
   * we can answer is a blind 401 — whereas OAuth 2.1 §4.14.2 asks us to revoke the
   * whole session, because two holders of the same chain means one of them is a thief.
   *
   * Indexed because `rotate` looks a row up on either column in a single query.
   * Null on a freshly issued token, which has replaced nothing yet.
   *
   * One generation deep, deliberately: a token two rotations old is unrecognizable
   * again and only gets a plain 401. Detecting the whole chain would mean a row per
   * rotation — four rows per hour per session at a 15-minute access token — which is
   * exactly what the one-row-per-session design exists to avoid. The generation that
   * matters is the last one, because that is the one an attacker actually holds.
   */
  @Exclude()
  @Index()
  @Column({ type: 'varchar', length: 64, nullable: true })
  previousTokenHash!: string | null;

  @Column({ type: 'varchar', length: 16 })
  kind!: HnRefreshTokenKind;

  @Type(() => HnUser)
  @ManyToOne(() => HnUser, { nullable: false, onDelete: 'CASCADE' })
  user!: HnUser;

  @BlLuxonDateTimeColumn()
  expiresAt!: DateTime;

  /** OAuth clients only: the registered client this token was issued to. */
  @Column({ type: 'varchar', length: 64, nullable: true })
  clientId!: string | null;

  /** OAuth clients only: the resource (audience) the renewed access token is for. */
  @Column({ type: 'varchar', length: 512, nullable: true })
  resource!: string | null;

  @BlLuxonDateTimeColumn({ update: false })
  createdAt!: DateTime;
}
