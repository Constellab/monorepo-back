import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HnCommunityApp } from './hn-community-app.entity';
import { EntityManager, Repository } from 'typeorm';
import { ClPage } from '@monorepo/core-lib';
import { BlAbstractPaginatedService } from '@monorepo/back-core-lib';
import { HnCommunityAppEditDto } from './hn-community-app.dto';
import { HnSpace } from '../../space-aggregate/space/hn-space.entity';
import { TeRichTextDTO } from '@monorepo/te-text-editor';

@Injectable()
export class HnCommunityAppService {
  constructor(
    @InjectRepository(HnCommunityApp) private readonly communityAppRepository: Repository<HnCommunityApp>
  ) {}

  async findOneById(id: string): Promise<HnCommunityApp> {
    return this.communityAppRepository.findOneBy({ id: id });
  }

  async findAll(page: number, size: number): Promise<ClPage<HnCommunityApp>> {
    return await BlAbstractPaginatedService.findPaginatedStatic(
      page,
      size,
      {
        order: { createdAt: 'DESC' as any },
      },
      this.communityAppRepository.manager,
      HnCommunityApp
    );
  }

  async findOneByAppUrl(appUrl: string): Promise<HnCommunityApp> {
    return this.communityAppRepository.findOneBy({ appUrl: appUrl });
  }

  async create(dto: HnCommunityAppEditDto, space: HnSpace = null): Promise<HnCommunityApp> {
    const app = new HnCommunityApp();
    app.updateFromDto(dto, space);
    return this.communityAppRepository.save(app);
  }

  async update(id: string, dto: HnCommunityAppEditDto, space: HnSpace = null): Promise<HnCommunityApp> {
    const app = await this.findOneById(id);
    if (app == null) {
      throw new Error('App not found');
    }
    app.updateFromDto(dto, space);
    return this.communityAppRepository.save(app);
  }

  async updateDescription(app: HnCommunityApp, newDescription: TeRichTextDTO): Promise<HnCommunityApp> {
    app.description = newDescription;
    return this.communityAppRepository.save(app);
  }

  async incrementExecutions(app: HnCommunityApp, entityManager: EntityManager): Promise<void> {
    app.executions++;
    await entityManager.save(app);
  }
}
