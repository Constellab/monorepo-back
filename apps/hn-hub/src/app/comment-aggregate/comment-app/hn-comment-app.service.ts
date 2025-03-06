import { Injectable } from '@nestjs/common';
import { HnAbstractCommentService } from '../comment-core/hn-abstract-comment.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { HnCommentApp } from './hn-comment-app.entity';
import { ClPage } from '@monorepo/core-lib';
import { BlAbstractPaginatedService } from '@monorepo/back-core-lib';
import { TeRichText } from '@monorepo/te-text-editor';
import { HnCommunityAppAggregateService } from '../../community-app-aggregate/hn-community-app-aggregate.service';
import { HnCommunityApp } from '../../community-app-aggregate/community-app/hn-community-app.entity';

@Injectable()
export class HnCommentAppService extends HnAbstractCommentService<HnCommunityApp> {
  constructor(
    private communityAppAggregateService: HnCommunityAppAggregateService,
    @InjectRepository(HnCommentApp) commentAppRepository: Repository<HnCommentApp>,
    dataSource: DataSource
  ) {
    super(commentAppRepository, dataSource);
  }

  async addComment(entityManager: EntityManager, entity: HnCommunityApp): Promise<HnCommunityApp> {
    return this.communityAppAggregateService.addComment(entity, entityManager);
  }

  createComment(entity: HnCommunityApp, commentData: TeRichText): HnCommentApp {
    const comment: HnCommentApp = new HnCommentApp();
    comment.entity = entity;
    comment.setContentRichText(commentData);
    return comment;
  }

  async getEntityById(entityId: string): Promise<HnCommunityApp> {
    return this.communityAppAggregateService.findOneById(entityId);
  }

  async removeComment(entityManager: EntityManager, entity: HnCommunityApp): Promise<HnCommunityApp> {
    return this.communityAppAggregateService.removeComment(entity, entityManager);
  }

  async saveComment(entityManager: EntityManager, comment: HnCommentApp): Promise<HnCommentApp> {
    return entityManager.save(comment);
  }

  async getComments(page: number, size: number, entityId: string): Promise<ClPage<HnCommentApp>> {
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
      HnCommentApp
    );
  }
}
