import {
  BlBadRequestException,
  BlFile,
  BlFileResponse,
  BlNotFoundException,
  BlObjectStorageService,
  BlSearchSortCriteria,
  BlUnauthorizedException,
} from '@monorepo/back-core-lib';
import { ClPage, ClStringHelper } from '@monorepo/core-lib';
import {
  TeBlockFigureUploadedResponse,
  TeBlockFileUploadResponse,
  TeRichTextDTO,
} from '@monorepo/te-text-editor';
import { Injectable } from '@nestjs/common';
import { DataSource, FindOptionsWhere, In, IsNull, Like } from 'typeorm';

import { HnInviteStatus } from '../core/model/config/hn-invite-status.enum';
import { HnSiteMapEnumChangefreq, HnSitemapItemBase } from '../core/model/config/hn-site-map.class';
import { HnCoreConfigService } from '../core/modules/core-config/hn-core-config.service';
import { HnFrontService } from '../core/service/hn-front.service';
import { HnCurrentUserHelper } from '../core/utils/hn-current-user.helper';
import { HnFileAppService } from '../file-aggregate/file-app/hn-file-app.service';
import { HnSpaceAggregateService } from '../space-aggregate/hn-space-aggregate.service';
import { HnSpace } from '../space-aggregate/space/hn-space.entity';
import { HnUser } from '../users/hn-user.entity';
import { HnUserService } from '../users/hn-user.service';
import { HnCommunityAppEditDto } from './community-app/hn-community-app.dto';
import { HnCommunityApp } from './community-app/hn-community-app.entity';
import { HnCommunityAppService } from './community-app/hn-community-app.service';
import { HnCommunityAppCoAuthor } from './community-app-co-author/hn-community-app-co-author.entity';
import { HnCommunityAppCoAuthorService } from './community-app-co-author/hn-community-app-co-author.service';
import { HnCommunityAppCoAuthorInvite } from './community-app-co-author-invite/hn-community-app-co-author-invite.entity';
import { HnCommunityAppStatLabDto } from './community-app-stat/hn-community-app-stat.dto';
import { HnCommunityAppStatService } from './community-app-stat/hn-community-app-stat.service';
import { HnCommunityAppUser } from './community-app-user/hn-community-app-user.entity';
import { HnCommunityAppUserService } from './community-app-user/hn-community-app-user.service';

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
    private readonly userService: HnUserService,
    private readonly communityAppCoAuthorService: HnCommunityAppCoAuthorService,
    private readonly coreConfigService: HnCoreConfigService,
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
  async getAndCheckCommunityApp(id: string): Promise<HnCommunityApp> {
    const communityApp = await this.communityAppService.findOneById(id);
    if (!communityApp) throw new BlNotFoundException('Community App not found');
    if (communityApp.space) {
      const currentUser = HnCurrentUserHelper.getCurrentUser();
      if (!currentUser) throw new BlNotFoundException('Community App not found');
      if (!(await this.spaceAggregateService.checkSpaceUser(communityApp.space.id, currentUser.id)))
        throw new BlNotFoundException('Community App not found');
    }
    return communityApp;
  }

  async findUserCommunityApps(
    userId: string,
    sortsCriteria: BlSearchSortCriteria[],
    page: number,
    size: number
  ): Promise<ClPage<HnCommunityApp>> {
    const user = await this.userService.findOne(userId);
    if (!user) throw new BlNotFoundException('User not found');
    const currentUser = HnCurrentUserHelper.getCurrentUser();
    let commonSpacesIds: string[] = [];
    if (currentUser) {
      commonSpacesIds = (await this.spaceAggregateService.getUserCommonSpace(userId)).map(
        (space) => space.id
      );
    }
    return this.findUserCommunityAppsWithCommonSpaces(user, commonSpacesIds, sortsCriteria, page, size);
  }

  async findUserCommunityAppsWithCommonSpaces(
    user: HnUser,
    commonSpacesIds: string[],
    sortsCriteria: BlSearchSortCriteria[],
    page: number,
    size: number
  ): Promise<ClPage<HnCommunityApp>> {
    const whereConditions: FindOptionsWhere<HnCommunityApp>[] | FindOptionsWhere<HnCommunityApp> = [];

    if (commonSpacesIds?.length > 0) {
      whereConditions.push({
        createdBy: {
          id: user.id,
        },
        space: {
          id: In(commonSpacesIds),
        },
      });
      whereConditions.push({
        communityAppCoAuthors: {
          user: {
            id: HnCurrentUserHelper.getCurrentUser().id,
          },
        },
        space: {
          id: In(commonSpacesIds),
        },
      });
    }

    whereConditions.push({
      createdBy: {
        id: user.id,
      },
      space: IsNull(),
    });

    whereConditions.push({
      communityAppCoAuthors: {
        user: {
          id: HnCurrentUserHelper.getCurrentUser().id,
        },
      },
      space: IsNull(),
    });

    return this.communityAppService.findAllPaginated(whereConditions, sortsCriteria, page, size);
  }

  async findAll(
    spacesFilter: string[],
    titleFilter: string,
    sortsCriteria: BlSearchSortCriteria[],
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

    return this.communityAppService.findAllPaginated(whereConditions, sortsCriteria, page, size);
  }

  async create(dto: HnCommunityAppEditDto): Promise<HnCommunityApp> {
    this.checkCommunityAppUrl(dto.appUrl);

    let space: HnSpace = null;
    if (dto.spaceId) {
      await this.spaceAggregateService.checkIfSpaceExists(dto.spaceId);
      space = await this.spaceAggregateService.findSpaceById(dto.spaceId);
    }
    return this.communityAppService.create(dto, space);
  }

  async update(dto: HnCommunityAppEditDto): Promise<HnCommunityApp> {
    if (dto.id == null) throw new BlBadRequestException('Id is required');
    this.checkCommunityAppUrl(dto.appUrl);
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

  private checkCommunityAppUrl(appUrl: string): void {
    if (!ClStringHelper.isHttpLink(appUrl))
      throw new Error('The app url must be a valid URL starting with http:// or https://');

    const urlWithoutHttp: string = appUrl.replace('http://', '').replace('https://', '');
    const urlFragment: string[] = urlWithoutHttp.split('/');
    if (urlFragment.length <= 0) throw new Error('The app url is not valid');

    const domain = urlFragment[0].split('?')[0];

    if (this.coreConfigService.isProduction()) {
      if (!domain.endsWith('.constellab.app')) {
        throw new Error(
          "The app url must be a valid Constellab app url, the domain must end with '.constellab.app'"
        );
      }
    } else {
      if (!domain.endsWith('.gencovery.io')) {
        throw new Error(
          "The app url must be a valid Constellab app url, the domain must end with '.gencovery.io'"
        );
      }
    }
  }

  ////////////////////////////////////// CO AUTHORS /////////////////////////////////
  public async inviteCommunityAppCoAuthor(communityAppId: string, emailOrId: string): Promise<boolean> {
    const communityApp = await this.getAndCheckCommunityApp(communityAppId);
    return this.communityAppCoAuthorService.inviteCommunityAppCoAuthor(communityApp, emailOrId);
  }

  public async getCommunityAppCoAuthors(communityAppId: string): Promise<HnCommunityAppCoAuthor[]> {
    await this.getAndCheckCommunityApp(communityAppId);
    return this.communityAppCoAuthorService.getCommunityAppCoAuthorsByCommunityAppId(communityAppId);
  }

  public async getCommunityAppCoAuthorsPendingInvites(
    communityAppId: string
  ): Promise<HnCommunityAppCoAuthorInvite[]> {
    await this.getAndCheckCommunityApp(communityAppId);
    return this.communityAppCoAuthorService.getCommunityAppCoAuthorsPendingInvites(communityAppId);
  }

  public async removeCommunityAppCoAuthor(id: string, communityAppCoAuthorUserId: string): Promise<void> {
    const communityApp = await this.getAndCheckCommunityApp(id);
    if (communityApp.createdBy.id != HnCurrentUserHelper.getCurrentUser().id) {
      throw new BlUnauthorizedException('You are not authorized to perform this action');
    }
    return this.communityAppCoAuthorService.removeCommunityAppCoAuthor(id, communityAppCoAuthorUserId);
  }

  public async isInviteValid(token: string): Promise<HnCommunityAppCoAuthorInvite> {
    const coAuthorInvite: HnCommunityAppCoAuthorInvite =
      await this.communityAppCoAuthorService.getCommunityAppCoAuthorInviteByToken(token);
    return coAuthorInvite &&
      coAuthorInvite.status == HnInviteStatus.PENDING &&
      coAuthorInvite.email === HnCurrentUserHelper.getCurrentUser()?.email
      ? coAuthorInvite
      : null;
  }

  public async acceptInvite(token: string): Promise<HnCommunityApp> {
    const coAuthorInvite: HnCommunityAppCoAuthorInvite =
      await this.communityAppCoAuthorService.getCommunityAppCoAuthorInviteByToken(token);
    if (!coAuthorInvite) throw new Error('Invalid invite');
    const communityApp = await this.communityAppService.findOneById(coAuthorInvite.communityApp.id);
    if (
      communityApp.space &&
      !(await this.spaceAggregateService.checkSpaceUser(
        communityApp.space.id,
        HnCurrentUserHelper.getCurrentUser()?.id
      ))
    ) {
      throw new BlUnauthorizedException('User is not in the space of the app');
    }

    const communityAppCoAuthor: HnCommunityAppCoAuthor = new HnCommunityAppCoAuthor();
    communityAppCoAuthor.communityApp = communityApp;
    communityAppCoAuthor.user = HnCurrentUserHelper.getCurrentUser();
    const acceptInvite = await this.communityAppCoAuthorService.acceptInvite(
      communityAppCoAuthor,
      coAuthorInvite
    );
    return acceptInvite ? communityApp : null;
  }

  public async deleteCoAuthorInvite(inviteId: string): Promise<boolean> {
    return this.communityAppCoAuthorService.deleteCoAuthorInvite(inviteId);
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
