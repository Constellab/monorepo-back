import { HnAbstractCommentEntity } from '../comment-core/hn-abstract-comment.entity';
import { Type } from 'class-transformer';
import { Entity, ManyToOne } from 'typeorm';
import { HnCommunityApp } from '../../community-app-aggregate/hn-community-app/hn-community-app.entity';

@Entity('comment_app')
export class HnCommentApp extends HnAbstractCommentEntity<HnCommunityApp> {
  @Type(() => HnCommunityApp)
  @ManyToOne(() => HnCommunityApp, { eager: true, onDelete: 'CASCADE' })
  entity: HnCommunityApp;
}
