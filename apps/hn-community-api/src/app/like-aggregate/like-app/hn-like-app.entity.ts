import { Type } from 'class-transformer';
import { Entity, ManyToOne, Unique } from 'typeorm';

import {
  HnCommunityApp,
  HnCommunityAppEntity,
} from '../../community-app-aggregate/community-app/hn-community-app.entity';
import { HnAbstractLikeEntity } from '../like-core/hn-abstract-like.entity';

@Unique(['entity', 'likedBy'])
@Entity('like_app')
export class HnLikeApp extends HnAbstractLikeEntity<HnCommunityApp> {
  @Type(() => HnCommunityAppEntity)
  @ManyToOne(() => HnCommunityAppEntity, { eager: true, onDelete: 'CASCADE' })
  entity: HnCommunityApp;
}
