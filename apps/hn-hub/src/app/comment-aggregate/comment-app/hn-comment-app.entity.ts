import { HnCommentEntity } from '../comment-core/hn-comment.entity';
import { Type } from 'class-transformer';
import { Entity, ManyToOne } from 'typeorm';
import { HnCommunityAppEntity } from '../../community-app-aggregate/community-app/hn-community-app.entity';

@Entity('comment_app')
export class HnCommentApp extends HnCommentEntity<HnCommunityAppEntity> {
  @Type(() => HnCommunityAppEntity)
  @ManyToOne(() => HnCommunityAppEntity, { eager: true, onDelete: 'CASCADE' })
  entity: HnCommunityAppEntity;
}
