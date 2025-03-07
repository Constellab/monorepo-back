import { HnAbstractLikeEntity } from '../like-core/hn-abstract-like.entity';
import { Type } from 'class-transformer';
import { Entity, ManyToOne } from 'typeorm';
import { HnCommunityAppEntity } from '../../community-app-aggregate/community-app/hn-community-app.entity';

@Entity('like_app')
export class HnLikeApp extends HnAbstractLikeEntity<HnCommunityAppEntity> {
  @Type(() => HnCommunityAppEntity)
  @ManyToOne(() => HnCommunityAppEntity, { eager: true, onDelete: 'CASCADE' })
  entity: HnCommunityAppEntity;
}
