import { HnAbstractCommentDto } from '../comment-core/hn-abstract-comment.dto';
import { HnCommentApp } from './hn-comment-app.entity';
import { HnCommunityAppDto } from '../../community-app-aggregate/hn-community-app/hn-community-app.dto';
import { HnCommunityApp } from '../../community-app-aggregate/hn-community-app/hn-community-app.entity';

export class HnCommentAppDto extends HnAbstractCommentDto {
  entity: HnCommunityAppDto;

  constructor(commentApp: HnCommentApp) {
    super(commentApp);
    this.entity = new HnCommunityAppDto(commentApp.entity as HnCommunityApp);
  }
}
