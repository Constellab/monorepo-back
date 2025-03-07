import { Injectable } from '@nestjs/common';
import { HnCommunityAppService } from './community-app/hn-community-app.service';
import { HnCommunityAppStatService } from './community-app-stat/hn-community-app-stat.service';
import { HnCommunityAppStatLabDto } from './community-app-stat/hn-community-app-stat.dto';
import { DataSource, FindOptionsWhere, In, IsNull, Like } from 'typeorm';
import { HnUser } from '../users/hn-user.entity';
import { HnCommunityAppEditDto } from './community-app/hn-community-app.dto';
import { HnCommunityApp, HnCommunityAppEntity } from './community-app/hn-community-app.entity';
import { ClPage } from '@monorepo/core-lib';
import { HnSpace } from '../space-aggregate/space/hn-space.entity';
import {
  BlBadRequestException,
  BlFile,
  BlFileResponse,
  BlObjectStorageService,
  BlUnauthorizedException,
} from '@monorepo/back-core-lib';
import { HnFileAppService } from '../file-aggregate/file-app/hn-file-app.service';
import {
  TeBlockFigureUploadedResponse,
  TeBlockFileUploadResponse,
  TeRichTextDTO,
} from '@monorepo/te-text-editor';
import { HnCurrentUserHelper } from '../core/utils/hn-current-user.helper';
import { HnSpaceAggregateService } from '../space-aggregate/hn-space-aggregate.service';
import { HnCommunityAppUserService } from './community-app-user/hn-community-app-user.service';
import { HnCommunityAppUser } from './community-app-user/hn-community-app-user.entity';
import { HnSiteMapEnumChangefreq, HnSitemapItemBase } from '../core/model/config/hn-site-map.class';
import { HnFrontService } from '../core/service/hn-front.service';

@Injectable()
export class HnCommunityAppAggregateService {
  constructor(
    private readonly communityAppService: HnCommunityAppService,
    private readonly communityAppStatService: HnCommunityAppStatService,
    private readonly spaceAggregateService: HnSpaceAggregateService,
    private readonly fileAppService: HnFileAppService,
    private readonly objectStorageService: BlObjectStorageService,
    private readonly communityAppUserService: HnCommunityAppUserService,
    private readonly frontService: HnFrontService,
    private dataSource: DataSource
  ) {}

  async getAllAppsMap(): Promise<HnSitemapItemBase[]> {
    const apps = await this.communityAppService.findAll(await this.getUserBasedWhereAppConditions());

    const appsMap: HnSitemapItemBase[] = [];
    for (const app of apps) {
      appsMap.push({
        url: this.frontService.getAppUrl(app.id, app.title),
        priority: 0.8,
        changefreq: HnSiteMapEnumChangefreq.MONTHLY,
        lastmod: app.lastModifiedAt.toFormat('yyyy-MM-dd'),
      });

      appsMap.push({
        url: this.frontService.getAppDetailUrl(app.id, app.title),
        priority: 0.8,
        changefreq: HnSiteMapEnumChangefreq.MONTHLY,
        lastmod: app.lastModifiedAt.toFormat('yyyy-MM-dd'),
      });
    }

    return appsMap;
  }

  ////////////////////////////////////// APP ////////////////////////////////////////
  async findOneById(id: string): Promise<HnCommunityAppEntity> {
    const communityApp = await this.communityAppService.findOneById(id);
    if (communityApp.space) {
      const currentUser = HnCurrentUserHelper.getCurrentUser();
      if (!currentUser) return null;
      if (!(await this.spaceAggregateService.checkSpaceUser(communityApp.space.id, currentUser.id)))
        return null;
    }
    return communityApp;
  }

  async findAll(
    spacesFilter: string[],
    titleFilter: string,
    page: number,
    size: number
  ): Promise<ClPage<HnCommunityApp>> {
    let publicSelected = false;
    let myApps = false;
    const currentUser: HnUser = HnCurrentUserHelper.getCurrentUser();

    for (const spaceId of spacesFilter) {
      if (spaceId === 'public') publicSelected = true;
      // Verify user right on spaces
      else if (spaceId === 'my-apps') myApps = true;
      else {
        if (currentUser != null) {
          await this.spaceAggregateService.assertCheckSpaceUser(spaceId, currentUser.id);
        }
      }
    }

    if (publicSelected) spacesFilter = spacesFilter.filter((s) => s !== 'public');
    if (myApps) spacesFilter = spacesFilter.filter((s) => s !== 'my-apps');

    const whereConditions: FindOptionsWhere<HnCommunityApp>[] | FindOptionsWhere<HnCommunityApp> = myApps
      ? await this.getMyAppsWhereAppConditions(publicSelected, spacesFilter, currentUser)
      : await this.getUserBasedWhereAppConditions(publicSelected, spacesFilter, currentUser);

    if (titleFilter) {
      if (whereConditions instanceof Array) {
        whereConditions.map((wc) => (wc.title = Like(`%${titleFilter}%`)));
      } else {
        whereConditions.title = Like(`%${titleFilter}%`);
      }
    }

    return this.communityAppService.findAllPaginated(whereConditions, page, size);
  }

  async create(dto: HnCommunityAppEditDto): Promise<HnCommunityApp> {
    if (!HnCommunityAppEntity.isValidAppUrl(dto.appUrl)) throw new BlBadRequestException('Invalid app url');

    let space: HnSpace = null;
    if (dto.spaceId) {
      await this.spaceAggregateService.checkIfSpaceExists(dto.spaceId);
      space = await this.spaceAggregateService.findSpaceById(dto.spaceId);
    }
    return this.communityAppService.create(dto, space);
  }

  async update(dto: HnCommunityAppEditDto): Promise<HnCommunityApp> {
    if (dto.id == null) throw new BlBadRequestException('Id is required');
    if (!HnCommunityAppEntity.isValidAppUrl(dto.appUrl)) throw new BlBadRequestException('Invalid app url');
    let space: HnSpace = null;
    if (dto.spaceId) {
      await this.spaceAggregateService.checkIfSpaceExists(dto.spaceId);
      space = await this.spaceAggregateService.findSpaceById(dto.spaceId);
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

  public async getAppPicture(filename: string): Promise<BlFileResponse> {
    return this.objectStorageService.downloadObject(this.fileAppService.getBucketConfig(), filename);
  }

  public async saveAppPicture(file: BlFile): Promise<string> {
    return await this.objectStorageService.uploadObject(
      [this.fileAppService.getBucketConfig(), this.fileAppService.getBackupBucketConfig()],
      file,
      { generateRandomObjectName: true }
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

  private async getUserBasedWhereAppConditions(
    publicSelected: boolean = null,
    spacesFilter: string[] = null,
    user: HnUser = null
  ): Promise<FindOptionsWhere<HnCommunityApp>[] | FindOptionsWhere<HnCommunityApp>> {
    const currentUser: HnUser = user ?? HnCurrentUserHelper.getCurrentUser();
    let whereConditions: FindOptionsWhere<HnCommunityApp>[] | FindOptionsWhere<HnCommunityApp>;

    if (currentUser == null) {
      whereConditions = [
        {
          space: {
            id: IsNull(),
          },
        },
      ];
    } else if (publicSelected) {
      whereConditions = [
        {
          space: {
            id: In(spacesFilter),
          },
        },
        {
          space: {
            id: IsNull(),
          },
        },
      ];
    } else if (spacesFilter && spacesFilter.length > 0) {
      whereConditions = [
        {
          space: {
            id: In(spacesFilter),
          },
        },
      ];
    } else {
      const userSpacesIds: string[] = (
        await this.spaceAggregateService.findSpacesOfUser(currentUser?.id)
      ).map((space) => space.id);

      whereConditions = [
        {
          space: IsNull(),
        },
        {
          space: In(userSpacesIds),
        },
      ];
    }

    return whereConditions;
  }

  private async getMyAppsWhereAppConditions(
    publicSelected: boolean,
    spacesFilter: string[],
    user: HnUser = null
  ): Promise<FindOptionsWhere<HnCommunityApp>[] | FindOptionsWhere<HnCommunityApp>> {
    const currentUser: HnUser = user ?? HnCurrentUserHelper.getCurrentUser();

    if (currentUser == null) {
      throw new BlUnauthorizedException('You are not authorized to perform this action');
    }

    let whereConditions: FindOptionsWhere<HnCommunityApp>[] | FindOptionsWhere<HnCommunityApp>;

    const communityAppUsers: HnCommunityAppUser[] =
      await this.communityAppUserService.getAppUsersByUser(currentUser);
    const coAuthorAppsId: string[] = communityAppUsers.map((appUser) => appUser.app.id);

    if (publicSelected) {
      whereConditions = [
        {
          space: {
            id: In(spacesFilter),
          },
          createdBy: {
            id: currentUser.id,
          },
        },
        {
          space: {
            id: IsNull(),
          },
          createdBy: {
            id: currentUser.id,
          },
        },
        {
          space: {
            id: In(spacesFilter),
          },
          id: In(coAuthorAppsId),
        },
        {
          space: {
            id: IsNull(),
          },
          id: In(coAuthorAppsId),
        },
      ];
    } else if (spacesFilter && spacesFilter.length > 0) {
      whereConditions = [
        {
          space: {
            id: In(spacesFilter),
          },
          createdBy: {
            id: currentUser.id,
          },
        },
        {
          space: {
            id: In(spacesFilter),
          },
          id: In(coAuthorAppsId),
        },
      ];
    } else {
      whereConditions = [
        {
          createdBy: {
            id: currentUser.id,
          },
        },
        {
          id: In(coAuthorAppsId),
        },
      ];
    }

    return whereConditions;
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
