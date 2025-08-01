import { Type } from 'class-transformer';
import { Entity, ManyToOne } from 'typeorm';

import {
  HnCommunityApp,
  HnCommunityAppEntity,
} from '../../community-app-aggregate/community-app/hn-community-app.entity';
import { HnCommentEntity } from '../comment-core/hn-comment.entity';

@Entity('comment_app')
export class HnCommentApp extends HnCommentEntity<HnCommunityApp> {
  @Type(() => HnCommunityAppEntity)
  @ManyToOne(() => HnCommunityAppEntity, { onDelete: 'CASCADE' })
  entity: HnCommunityApp;
}
