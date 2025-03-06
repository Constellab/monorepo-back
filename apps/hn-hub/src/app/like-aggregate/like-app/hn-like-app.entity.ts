import { HnAbstractLikeEntity } from '../like-core/hn-abstract-like.entity';
import { Type } from 'class-transformer';
import { Entity, ManyToOne } from 'typeorm';
import { HnCommunityApp } from '../../community-app-aggregate/community-app/hn-community-app.entity';

@Entity('like_app')
export class HnLikeApp extends HnAbstractLikeEntity<HnCommunityApp> {
  @Type(() => HnCommunityApp)
  @ManyToOne(() => HnCommunityApp, { eager: true, onDelete: 'CASCADE' })
  entity: HnCommunityApp;
}
