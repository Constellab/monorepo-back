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
