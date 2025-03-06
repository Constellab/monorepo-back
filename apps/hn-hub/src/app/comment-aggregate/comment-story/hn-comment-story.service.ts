import { Injectable } from '@nestjs/common';
import { HnAbstractCommentService } from '../comment-core/hn-abstract-comment.service';
import { HnCommentStory } from './hn-comment-story.entity';
import { HnStoryService } from '../../story/hn-story.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { HnStory } from '../../story/hn-story.entity';
import { ClPage } from '@monorepo/core-lib';
import { BlAbstractPaginatedService } from '@monorepo/back-core-lib';
import { TeRichText } from '@monorepo/te-text-editor';

@Injectable()
export class HnCommentStoryService extends HnAbstractCommentService<HnStory> {
  constructor(
    private storyService: HnStoryService,
    @InjectRepository(HnCommentStory) commentStoryRepository: Repository<HnCommentStory>,
    dataSource: DataSource
  ) {
    super(commentStoryRepository, dataSource);
  }

  async addComment(entityManager: EntityManager, entity: HnStory): Promise<HnStory> {
    return this.storyService.addComment(entity, entityManager);
  }

  createComment(entity: HnStory, commentData: TeRichText): HnCommentStory {
    const comment: HnCommentStory = new HnCommentStory();
    comment.entity = entity;
    comment.setContentRichText(commentData);
    return comment;
  }

  async getEntityById(entityId: string): Promise<HnStory> {
    return this.storyService.getStory(entityId);
  }

  async removeComment(entityManager: EntityManager, entity: HnStory): Promise<HnStory> {
    return this.storyService.removeComment(entity, entityManager);
  }

  async saveComment(entityManager: EntityManager, comment: HnCommentStory): Promise<HnCommentStory> {
    return entityManager.save(comment);
  }

  async getComments(page: number, size: number, entityId: string): Promise<ClPage<HnCommentStory>> {
    return await BlAbstractPaginatedService.findPaginatedStatic(
      page,
      size,
      {
        where: {
          entity: {
            id: entityId,
          },
        },
        order: {
          createdAt: 'DESC' as any,
        },
      },
      this.repository.manager,
      HnCommentStory
    );
  }
}
