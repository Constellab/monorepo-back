import { Injectable } from '@nestjs/common';
import { HnCommunityAppService } from './hn-community-app/hn-community-app.service';
import { HnCommunityAppStatService } from './hn-community-app-stat/hn-community-app-stat.service';
import { HnCommunityAppStatLabDto } from './hn-community-app-stat/hn-community-app-stat.dto';
import { DataSource, EntityManager } from 'typeorm';
import { HnUser } from '../users/hn-user.entity';
import { HnCommunityAppEditDto } from './hn-community-app/hn-community-app.dto';
import { HnCommunityApp } from './hn-community-app/hn-community-app.entity';
import { ClPage, ClStringHelper } from '@monorepo/core-lib';
import { HnSpace } from '../space-aggregate/space/hn-space.entity';
import { HnSpaceService } from '../space-aggregate/space/hn-space.service';
import {
  BlBadRequestException,
  BlFile,
  BlFileResponse,
  BlObjectStorageService,
} from '@monorepo/back-core-lib';
import { HnFileAppService } from '../file-aggregate/file-app/hn-file-app.service';
import {
  TeBlockFigureUploadedResponse,
  TeBlockFileUploadResponse,
  TeRichTextDTO,
} from '@monorepo/te-text-editor';

@Injectable()
export class HnCommunityAppAggregateService {
  constructor(
    private readonly communityAppService: HnCommunityAppService,
    private readonly communityAppStatService: HnCommunityAppStatService,
    private readonly spaceService: HnSpaceService,
    private readonly fileAppService: HnFileAppService,
    private readonly objectStorageService: BlObjectStorageService,
    private dataSource: DataSource
  ) {}

  ////////////////////////////////////// APP ////////////////////////////////////////
  async findOneById(id: string): Promise<HnCommunityApp> {
    return await this.communityAppService.findOneById(id);
  }

  async findAll(page: number, size: number): Promise<ClPage<HnCommunityApp>> {
    return this.communityAppService.findAll(page, size);
  }

  async create(dto: HnCommunityAppEditDto): Promise<HnCommunityApp> {
    if (!HnCommunityApp.isValidAppUrl(dto.appUrl)) throw new BlBadRequestException('Invalid app url');

    let space: HnSpace = null;
    if (dto.spaceId) {
      space = await this.spaceService.findOne(dto.spaceId);
    }
    return this.communityAppService.create(dto, space);
  }

  async update(dto: HnCommunityAppEditDto): Promise<HnCommunityApp> {
    if (dto.id == null) throw new BlBadRequestException('Id is required');
    if (!HnCommunityApp.isValidAppUrl(dto.appUrl)) throw new BlBadRequestException('Invalid app url');
    let space: HnSpace = null;
    if (dto.spaceId) {
      space = await this.spaceService.findOne(dto.spaceId);
    }
    return this.communityAppService.update(dto.id, dto, space);
  }

  async updateDescription(appId: string, newDescription: TeRichTextDTO): Promise<HnCommunityApp> {
    const app = await this.communityAppService.findOneById(appId);
    if (!app) {
      throw new BlBadRequestException('App not found');
    }
    return this.communityAppService.updateDescription(app, newDescription);
  }

  public async addComment(app: HnCommunityApp, entityManager: EntityManager): Promise<HnCommunityApp> {
    app.comments++;
    return entityManager.save(app);
  }

  public async removeComment(app: HnCommunityApp, entityManager: EntityManager): Promise<HnCommunityApp> {
    app.comments--;
    return entityManager.save(app);
  }

  public async addLike(app: HnCommunityApp, entityManager: EntityManager): Promise<HnCommunityApp> {
    app.likes++;
    return entityManager.save(app);
  }

  public async removeLike(app: HnCommunityApp, entityManager: EntityManager): Promise<HnCommunityApp> {
    app.likes--;
    return entityManager.save(app);
  }

  public async getAppPicture(filename: string): Promise<BlFileResponse> {
    return this.objectStorageService.downloadObject(this.fileAppService.getBucketConfig(), filename);
  }

  public async saveAppPicture(file: BlFile): Promise<string> {
    const fileExt = file.originalname.split('.').pop();
    file.originalname = ClStringHelper.generateUUID() + '.' + fileExt;
    return await this.objectStorageService.uploadObject(
      [this.fileAppService.getBucketConfig(), this.fileAppService.getBackupBucketConfig()],
      file,
      { generateRandomObjectName: false }
    );
  }

  public async deleteAppPicture(filename: string): Promise<boolean> {
    return await this.objectStorageService.deleteObjectIfExist(
      [this.fileAppService.getBucketConfig(), this.fileAppService.getBackupBucketConfig()],
      filename
    );
  }

  public async saveFile(file: BlFile, appId: string): Promise<TeBlockFileUploadResponse> {
    const app = await this.communityAppService.findOneById(appId);
    if (!app) {
      throw new BlBadRequestException('App not found');
    }
    return this.fileAppService.saveFile(app, file);
  }

  public async saveImage(file: BlFile, appId: string): Promise<TeBlockFigureUploadedResponse> {
    const app = await this.communityAppService.findOneById(appId);
    if (!app) {
      throw new BlBadRequestException('App not found');
    }
    return this.fileAppService.saveImage(app, file);
  }

  public async saveResourceViewFile(file: BlFile, appId: string): Promise<string> {
    const app = await this.communityAppService.findOneById(appId);
    if (!app) {
      throw new BlBadRequestException('App not found');
    }
    return this.fileAppService.saveResourceView(app, file);
  }

  ////////////////////////////////////// LAB ////////////////////////////////////////
  async newCommunityAppStat(labStatDto: HnCommunityAppStatLabDto): Promise<void> {
    const app = await this.communityAppService.findOneByAppUrl(labStatDto.app_url);
    if (!app) {
      return;
    }
    const user: HnUser = app.createdBy;
    if (!user) {
      throw new Error('App creator not found');
    }
    return await this.dataSource.transaction(async (entityManager) => {
      await this.communityAppStatService.create(user, labStatDto, entityManager);
      await this.communityAppService.incrementExecutions(app, entityManager);
    });
  }
}
