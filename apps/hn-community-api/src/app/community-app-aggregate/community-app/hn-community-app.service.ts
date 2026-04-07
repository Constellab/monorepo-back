import {
  BlAbstractPaginatedService,
  BlNotFoundException,
  BlSearchSortCriteria,
} from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import { TeRichTextDTO } from '@monorepo/te-text-editor';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, Like, Repository } from 'typeorm';

import { HnSpace } from '../../space-aggregate/space/hn-space.entity';
import { HnCommunityAppEditDto } from './hn-community-app.dto';
import { HnCommunityApp, HnCommunityAppEntity } from './hn-community-app.entity';

@Injectable()
export class HnCommunityAppService {
  constructor(
    @InjectRepository(HnCommunityAppEntity)
    private readonly communityAppRepository: Repository<HnCommunityAppEntity>
  ) {}

  async findOneById(id: string): Promise<HnCommunityApp> {
    return this.communityAppRepository.findOneBy({ id: id });
  }

  async findAll(
    whereConditions: FindOptionsWhere<HnCommunityApp>[] | FindOptionsWhere<HnCommunityApp>
  ): Promise<HnCommunityApp[]> {
    return this.communityAppRepository.find({
      where: whereConditions,
      order: { lastModifiedAt: 'DESC' as any },
    });
  }

  async findAllPaginated(
    whereConditions: FindOptionsWhere<HnCommunityApp>[] | FindOptionsWhere<HnCommunityApp>,
    sortsCriteria: BlSearchSortCriteria[],
    page: number,
    size: number
  ): Promise<ClPage<HnCommunityApp>> {
    const order: any = sortsCriteria?.length > 0 ? {} : { createdAt: 'DESC' };
    for (const criteria of sortsCriteria) {
      order[criteria.key] = criteria.direction;
    }

    return await BlAbstractPaginatedService.findPaginatedStatic(
      page,
      size,
      {
        where: whereConditions,
        order: order,
      },
      this.communityAppRepository.manager,
      HnCommunityAppEntity
    );
  }

  async findOneByAppUrl(appUrl: string): Promise<HnCommunityApp> {
    return this.communityAppRepository.findOneBy({ appUrl: Like(`${appUrl}%`) });
  }

  async create(dto: HnCommunityAppEditDto, space: HnSpace = null): Promise<HnCommunityApp> {
    const app = new HnCommunityAppEntity();
    const updatedApp = this.updateFromDto(app, dto, space);
    return this.communityAppRepository.save(updatedApp);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.communityAppRepository.delete({ id: id });
    return result.affected > 0;
  }

  async update(id: string, dto: HnCommunityAppEditDto, space: HnSpace = null): Promise<HnCommunityApp> {
    const app = await this.findOneById(id);
    if (app == null) {
      throw new BlNotFoundException('App not found');
    }
    const updatedApp = this.updateFromDto(app, dto, space);
    return this.communityAppRepository.save(updatedApp);
  }

  updateFromDto(app: HnCommunityApp, dto: HnCommunityAppEditDto, space: HnSpace = null): HnCommunityApp {
    app.title = dto.title;
    app.appUrl = dto.appUrl;
    app.contactMail = dto.contactMail;
    app.picture = dto.picture;
    app.space = space;
    return app;
  }

  async updateDescription(app: HnCommunityApp, newDescription: TeRichTextDTO): Promise<HnCommunityApp> {
    app.description = newDescription;
    return this.communityAppRepository.save(app);
  }

  async updateMedia(app: HnCommunityApp, video: string, figures: string[]): Promise<HnCommunityApp> {
    app.video = video;
    app.figures = figures;
    return this.communityAppRepository.save(app);
  }

  async rearrangeMedias(app: HnCommunityApp, figures: string[]): Promise<HnCommunityApp> {
    app.figures = figures;
    return this.communityAppRepository.save(app);
  }

  async incrementExecutions(app: HnCommunityApp, entityManager: EntityManager): Promise<void> {
    app.executions++;
    await entityManager.save(app, { listeners: false });
  }

  async updateComments(appId: string, numberOfComments: number): Promise<void> {
    const app = await this.findOneById(appId);
    app.comments = numberOfComments;
    await this.communityAppRepository.save(app);
  }

  async updateLikes(appId: string, numberOfLikes: number): Promise<void> {
    const app = await this.findOneById(appId);
    app.likes = numberOfLikes;
    await this.communityAppRepository.save(app, { listeners: false });
  }
}
