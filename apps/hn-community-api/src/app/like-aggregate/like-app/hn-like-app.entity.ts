import { Type } from 'class-transformer';
import { Entity, ManyToOne } from 'typeorm';

import {
  HnCommunityApp,
  HnCommunityAppEntity,
} from '../../community-app-aggregate/community-app/hn-community-app.entity';
import { HnAbstractLikeEntity } from '../like-core/hn-abstract-like.entity';

@Entity('like_app')
export class HnLikeApp extends HnAbstractLikeEntity<HnCommunityApp> {
  @Type(() => HnCommunityAppEntity)
  @ManyToOne(() => HnCommunityAppEntity, { eager: true, onDelete: 'CASCADE' })
  entity: HnCommunityApp;
}
