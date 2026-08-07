import { BlRefreshTokenEntity } from '@monorepo/back-core-lib';
import { Type } from 'class-transformer';
import { Entity, ManyToOne } from 'typeorm';

import { HnUser } from '../../users/hn-user.entity';

/**
 * The Community's refresh token row.
 *
 * Every column, and the rotation that guards them, live in `BlRefreshTokenEntity` and
 * `BlRefreshTokenService`. All that is left here is the relation to the Community's own
 * user record — the one thing the shared code cannot know.
 */
@Entity('refresh_token')
export class HnRefreshToken extends BlRefreshTokenEntity<HnUser> {
  @Type(() => HnUser)
  @ManyToOne(() => HnUser, { nullable: false, onDelete: 'CASCADE' })
  user!: HnUser;
}
