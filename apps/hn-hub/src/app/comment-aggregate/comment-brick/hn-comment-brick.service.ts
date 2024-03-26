import {Injectable} from '@nestjs/common';
import {HnAbstractCommentService} from '../comment-core/hn-abstract-comment.service';
import {HnCommentBrick} from './hn-comment-brick.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {ClPage} from '@monorepo/core-lib';
import {BlAbstractPaginatedService, BlNotFoundException, BlRichTextContent} from '@monorepo/back-core-lib';
import {HnBrickAggregateService} from '../../brick-aggregate/hn-brick-aggregate.service';

@Injectable()
export class HnCommentBrickService extends HnAbstractCommentService {
  constructor(
    @InjectRepository(HnCommentBrick)
    private commentBrickRepository: Repository<HnCommentBrick>,
    private brickAggregateService: HnBrickAggregateService,
    private dataSource: DataSource
  ) {
    super();
  }

  async createComment(content: BlRichTextContent, entityId: string): Promise<HnCommentBrick> {
    const brick = await this.brickAggregateService.findBrickById(entityId);
    if (!brick) {
      throw new BlNotFoundException('Brick not found');
    }

    if (!content) {
      throw new BlNotFoundException('Content is required');
    }


    return await this.dataSource.transaction(async entityManager => {
      const comment = new HnCommentBrick();
      comment.content = content;
      comment.brick = brick;

      const res = await this.commentBrickRepository.save(comment);
      if (!res){
        throw new Error('Error while creating the comment');
      }
      await this.brickAggregateService.addComment(res.brick, entityManager);
      return res;
    });
  }

  async deleteComment(commentId: string): Promise<void> {
    const comment = await this.commentBrickRepository.findOneBy({id: commentId});
    await this.dataSource.transaction(async entityManager => {
      await entityManager.remove(comment);
      await this.brickAggregateService.removeComment(comment.brick, entityManager);
    });
  }

  async getComments(page: number, size: number, entityId: string): Promise<ClPage<HnCommentBrick>> {
    return BlAbstractPaginatedService.findPaginatedStatic(page, size, {
      where: {
        brick: {
          id: entityId
        }
      },
      order: {
        createdAt: 'DESC' as any
      }
    }, this.commentBrickRepository.manager, HnCommentBrick);
  }


}
