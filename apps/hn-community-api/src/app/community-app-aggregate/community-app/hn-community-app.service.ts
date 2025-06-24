import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HnCommunityApp, HnCommunityAppEntity } from './hn-community-app.entity';
import { EntityManager, FindOptionsWhere, Repository } from 'typeorm';
import { ClPage } from '@monorepo/core-lib';
import { BlAbstractPaginatedService } from '@monorepo/back-core-lib';
import { HnCommunityAppEditDto } from './hn-community-app.dto';
import { HnSpace } from '../../space-aggregate/space/hn-space.entity';
import { TeRichTextDTO } from '@monorepo/te-text-editor';

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
    page: number,
    size: number
  ): Promise<ClPage<HnCommunityApp>> {
    return await BlAbstractPaginatedService.findPaginatedStatic(
      page,
      size,
      {
        where: whereConditions,
        order: { lastModifiedAt: 'DESC' as any },
      },
      this.communityAppRepository.manager,
      HnCommunityAppEntity
    );
  }

  async findOneByAppUrl(appUrl: string): Promise<HnCommunityApp> {
    return this.communityAppRepository.findOneBy({ appUrl: appUrl });
  }

  async create(dto: HnCommunityAppEditDto, space: HnSpace = null): Promise<HnCommunityApp> {
    const app = new HnCommunityAppEntity();
    const updatedApp = this.updateFromDto(app, dto, space);
    return this.communityAppRepository.save(updatedApp);
  }

  async update(id: string, dto: HnCommunityAppEditDto, space: HnSpace = null): Promise<HnCommunityApp> {
    const app = await this.findOneById(id);
    if (app == null) {
      throw new Error('App not found');
    }
    const updatedApp = this.updateFromDto(app, dto, space);
    return this.communityAppRepository.save(updatedApp);
  }

  updateFromDto(app: HnCommunityApp, dto: HnCommunityAppEditDto, space: HnSpace = null): HnCommunityApp {
    app.title = dto.title;
    app.appUrl = dto.appUrl;
    app.picture = dto.picture;
    app.description = dto.description;
    app.space = space;
    return app;
  }

  async updateDescription(app: HnCommunityApp, newDescription: TeRichTextDTO): Promise<HnCommunityApp> {
    app.description = newDescription;
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
