import { BlRefreshTokenEntity } from '@monorepo/back-core-lib';
import { Type } from 'class-transformer';
import { Entity, ManyToOne } from 'typeorm';

import { CnUserEntity } from '../../cn-users/cn-user.entity';

/**
 * The Space API's refresh token row.
 *
 * Every column, and the rotation that guards them, live in `BlRefreshTokenEntity` and
 * `BlRefreshTokenService`. All that is left here is the relation to this application's
 * own user record — the one thing the shared code cannot know.
 *
 * Deliberately the same table name and shape as the Community's: they are two databases,
 * and one rotation implementation reads both.
 */
@Entity('refresh_token')
export class CnRefreshToken extends BlRefreshTokenEntity<CnUserEntity> {
  @Type(() => CnUserEntity)
  @ManyToOne(() => CnUserEntity, { nullable: false, onDelete: 'CASCADE' })
  user!: CnUserEntity;
}
