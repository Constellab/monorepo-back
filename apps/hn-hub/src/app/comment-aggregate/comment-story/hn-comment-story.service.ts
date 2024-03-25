import {Injectable} from '@nestjs/common';
import {HnAbstractCommentService} from '../comment-core/hn-abstract-comment.service';
import {HnCommentStory} from './hn-comment-story.entity';
import {HnStoryService} from '../../story/hn-story.service';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {ClPage} from '@monorepo/core-lib';
import {BlAbstractPaginatedService, BlNotFoundException} from '@monorepo/back-core-lib';

@Injectable()
export class HnCommentStoryService extends HnAbstractCommentService {
  constructor(
    @InjectRepository(HnCommentStory)
    private commentStoryRepository: Repository<HnCommentStory>,
    private storyService: HnStoryService,
  ) {
    super();
  }

  async createComment(content: Record<string, any>, entityId: string): Promise<HnCommentStory> {
    const story = await this.storyService.getStory(entityId);
    if (!story) {
      throw new BlNotFoundException('Story not found');
    }

    if (!content) {
      throw new BlNotFoundException('Content is required');
    }

    const comment = new HnCommentStory();
    comment.content = content;
    comment.story = story;
    return this.commentStoryRepository.save(comment);
  }

  async deleteComment(commentId: string): Promise<void> {
    const comment = await this.commentStoryRepository.findOneBy({id: commentId});
    await this.commentStoryRepository.remove(comment);
  }

  async getComments(page: number, size: number, entityId: string): Promise<ClPage<HnCommentStory>> {
    return BlAbstractPaginatedService.findPaginatedStatic(page, size, {
      where: {
        story: {
          id: entityId
        }
      },
      order: {
        createdAt: 'DESC' as any
      }
    }, this.commentStoryRepository.manager, HnCommentStory);
  }


}
