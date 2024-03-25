import {HnAbstractCommentEntity} from './hn-abstract-comment.entity';
import {ClPage} from '@monorepo/core-lib';

export abstract class HnAbstractCommentService {
  abstract getComments(page: number, size: number, entityId: string): Promise<ClPage<HnAbstractCommentEntity>>;

  abstract createComment(content: Record<string, any>, entityId: string): Promise<HnAbstractCommentEntity>;

  abstract deleteComment(commentId: string): Promise<void>;
}
