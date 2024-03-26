import {Injectable} from '@nestjs/common';
import {HnAbstractCommentService} from '../comment-core/hn-abstract-comment.service';
import {HnCommentStory} from './hn-comment-story.entity';
import {HnStoryService} from '../../story/hn-story.service';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {ClPage} from '@monorepo/core-lib';
import {BlAbstractPaginatedService, BlNotFoundException, BlRichTextContent} from '@monorepo/back-core-lib';

@Injectable()
export class HnCommentStoryService extends HnAbstractCommentService {
  constructor(
    @InjectRepository(HnCommentStory)
    private commentStoryRepository: Repository<HnCommentStory>,
    private storyService: HnStoryService,
    private dataSource: DataSource
  ) {
    super();
  }

  async createComment(content: BlRichTextContent, entityId: string): Promise<HnCommentStory> {
    const story = await this.storyService.getStory(entityId);
    if (!story) {
      throw new BlNotFoundException('Story not found');
    }

    if (!content) {
      throw new BlNotFoundException('Content is required');
    }


    return await this.dataSource.transaction(async entityManager => {
      const comment = new HnCommentStory();
      comment.content = content;
      comment.story = story;

      const res = await this.commentStoryRepository.save(comment);
      if (!res){
        throw new Error('Error while creating the comment');
      }
      await this.storyService.addComment(res.story, entityManager);
      return res;
    });
  }

  async deleteComment(commentId: string): Promise<void> {
    const comment = await this.commentStoryRepository.findOneBy({id: commentId});
    await this.dataSource.transaction(async entityManager => {
      await entityManager.remove(comment);
      await this.storyService.removeComment(comment.story, entityManager);
    });
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
