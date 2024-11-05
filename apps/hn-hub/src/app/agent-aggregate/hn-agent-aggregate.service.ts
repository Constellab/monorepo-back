import { Injectable } from '@nestjs/common';
import { HnAgentService } from './agent/hn-agent.service';
import { HnAgentVersionService } from './agent-version/hn-agent-version.service';
import { HnAgentVersion, HnAgentVersionState } from './agent-version/hn-agent-version.entity';
import {
  baseAgentStyle,
  HaCreateAgentVersionFromLabResponseDto,
  HnAgentDto,
  HnAgentEditStyleData,
  HnAgentForLabDto,
  HnAgentVersionFileInput,
  HnAgentVersionForLabDto,
  HnCreateAgentDto,
} from './agent/hn-agent.dto';
import { HnSpaceAggregateService } from '../space-aggregate/hn-space-aggregate.service';
import { HnAgent } from './agent/hn-agent.entity';
import { DataSource, EntityManager } from 'typeorm';
import { HnCurrentUserHelper } from '../core/utils/hn-current-user.helper';
import { ClPage, ClStringHelper } from '@monorepo/core-lib';
import {
  BlBadRequestException,
  BlCurrentUserHelper,
  BlFile,
  BlNotFoundException,
  BlRichTextUploadedImageResponse,
  BlUnauthorizedException,
} from '@monorepo/back-core-lib';
import { HnBrickAggregateService } from '../brick-aggregate/hn-brick-aggregate.service';
import { HnBrickVersion } from '../brick-aggregate/brick-version/hn-brick-version.entity';
import { HnAgentVersionBrickDependenciesService } from './agent-version-brick-dependencies/hn-agent-version-brick-dependencies.service';
import { HnAgentVersionBrickDependencies } from './agent-version-brick-dependencies/hn-agent-version-brick-dependencies.entity';
import { HnUser } from '../users/hn-user.entity';
import { HnUserService } from '../users/hn-user.service';
import { HnLabConstellabApiService } from '../core/service/hn-lab-constellab-api.service';
import { HnAgentCoAuthorService } from './agent-co-author/hn-agent-co-author.service';
import { HnAgentCoAuthorInvite } from './agent-co-author-invite/hn-agent-co-author-invite.entity';
import { HnInviteStatus } from '../core/model/config/hn-invite-status.enum';
import { HnAgentCoAuthor } from './agent-co-author/hn-agent-co-author.entity';
import { HnSiteMapEnumChangefreq, HnSitemapItemBase } from '../core/model/config/hn-site-map.class';
import { HnFrontService } from '../core/service/hn-front.service';
import { HnBrickVersionDto } from '../brick-aggregate/brick-version/hn-brick-version.dto';
import { HnAgentVersionDto } from './agent-version/hn-agent-version.dto';
import { HnUserDto } from '../users/hn-user.dto';
import { HnSpaceDto } from '../space-aggregate/space/hn-space.dto';
import { HnUploadFileResponseDto } from '../file-aggregate/file-core/hn-abstract-file.dto';
import { HnFileAgentService } from '../file-aggregate/file-agent/hn-file-agent.service';
import { Request } from 'express';
import { HnAgentVersionMigrator } from './agent-version/hn-agent-version-migrator.class';
import { HnTypingStyle } from '../brick-aggregate/brick/hn-brick.dto';

@Injectable()
export class HnAgentAggregateService {
  constructor(
    private readonly agentService: HnAgentService,
    private readonly agentVersionService: HnAgentVersionService,
    private readonly agentVersionBrickDependenciesService: HnAgentVersionBrickDependenciesService,
    private readonly spaceAggregateService: HnSpaceAggregateService,
    private readonly brickAggregateService: HnBrickAggregateService,
    private readonly labConstellabApiService: HnLabConstellabApiService,
    private readonly userService: HnUserService,
    private readonly agentCoAuthorService: HnAgentCoAuthorService,
    private readonly frontService: HnFrontService,
    private readonly fileAgentService: HnFileAgentService,
    private dataSource: DataSource
  ) {}

  public async create(
    createAgentDto: HnCreateAgentDto,
    parentAgentVersionId: string = null,
    user: HnUser = null
  ): Promise<HnAgentVersion> {
    const currentUser = user ? user : HnCurrentUserHelper.getCurrentUser();
    return await this.dataSource.transaction(async (entityManager) => {
      if (createAgentDto.space != null) {
        await this.spaceAggregateService.assertCheckSpaceUser(createAgentDto.space.id, currentUser.id);
      }
      const agent: HnAgent = await this.agentService.create(
        createAgentDto,
        entityManager,
        parentAgentVersionId,
        user
      );
      const newAgentVersion = await this.agentVersionService.createFirstVersion(
        agent,
        createAgentDto.versionFile,
        entityManager
      );

      for (const brick of createAgentDto.versionFile.bricks) {
        const brickVersion: HnBrickVersion = await this.brickAggregateService.getAndCheckBrickVersion(
          brick.name,
          brick.version
        );
        await this.agentVersionBrickDependenciesService.create(newAgentVersion, brickVersion, entityManager);
      }

      return newAgentVersion;
    });
  }

  public async createForLab(
    createAgentDto: HnCreateAgentDto
  ): Promise<HaCreateAgentVersionFromLabResponseDto> {
    const user = HnCurrentUserHelper.getAndCheckLabInstanceCurrentUser();
    const agentVersion: HnAgentVersion = await this.create(createAgentDto, null, user);
    return {
      id: agentVersion.agent.id,
      title: ClStringHelper.getCleanUrlPath(agentVersion.agent.title),
      agent_version: agentVersion.version.toString(),
    };
  }

  public async forkForLab(
    parentAgentVersionId: string,
    createAgentDto: HnCreateAgentDto
  ): Promise<HaCreateAgentVersionFromLabResponseDto> {
    const user = HnCurrentUserHelper.getAndCheckLabInstanceCurrentUser();
    if (parentAgentVersionId == null)
      throw new BlBadRequestException('The parent agent version id is required');
    const agentVersion: HnAgentVersion = await this.create(createAgentDto, parentAgentVersionId, user);
    return {
      id: agentVersion.agent.id,
      title: ClStringHelper.getCleanUrlPath(agentVersion.agent.title),
      agent_version: agentVersion.version.toString(),
    };
  }

  public async createNewVersionForLab(
    agentId: string,
    newAgentVersionFile: HnAgentVersionFileInput
  ): Promise<HaCreateAgentVersionFromLabResponseDto> {
    const user = HnCurrentUserHelper.getAndCheckLabInstanceCurrentUser();
    const agent: HnAgent = await this.agentService.findOne(agentId);

    if (agent.createdBy.id != user.id) {
      const coAuthors = await this.agentCoAuthorService.getAgentCoAuthorsByAgentId(agentId);
      if (!coAuthors.some((coAuthor) => coAuthor.id == user.id)) throw new BlUnauthorizedException();
    }
    if ((await this.agentVersionService.findLatestByAgent(agent)).versionState == 'DRAFT')
      throw new BlBadRequestException('The agent already has a draft version');
    const newAgentVersion = await this.createNewDraftVersion(agentId, newAgentVersionFile, true);
    return {
      id: newAgentVersion.agent.id,
      title: ClStringHelper.getCleanUrlPath(newAgentVersion.agent.title),
      agent_version: newAgentVersion.version.toString(),
    };
  }

  public async updateTitle(id: string, title: string): Promise<HnAgent> {
    return this.agentService.updateTitle(id, title);
  }

  public async updateDescription(id: string, description: Record<string, any>): Promise<HnAgent> {
    return this.agentService.updateDescription(id, description);
  }

  public async findPublic(): Promise<HnAgentDto[]> {
    return this.agentService.findPublic();
  }

  /**
   * Find liv task list for lab user
   * @param spacesFilter
   * @param titleFilter
   * @param personalOnly
   * @param page
   * @param size
   */
  public async getAgentsForLab(
    spacesFilter: string[],
    titleFilter: string,
    personalOnly: boolean,
    page: number,
    size: number
  ): Promise<ClPage<HnAgentForLabDto>> {
    const user = HnCurrentUserHelper.getAndCheckLabInstanceCurrentUser();
    return (await this.findAllWithFilters(spacesFilter, titleFilter, page, size, user, personalOnly)).map(
      (agent) => HnAgentForLabDto.fromAgentDto(agent)
    );
  }

  public async getAgentForLabByVersionId(
    versionId: string,
    versionNumber: number
  ): Promise<HnAgentForLabDto> {
    const user = HnCurrentUserHelper.getAndCheckLabInstanceCurrentUser();
    const agentVersion: HnAgentVersion = await this.agentVersionService.findOne(versionId);
    const agent = agentVersion.agent;
    if (agent.space != null) {
      await this.spaceAggregateService.assertCheckSpaceUser(agent.space.id, user.id);
    }
    if (agentVersion?.agent == null) {
      throw new BlNotFoundException('Agent not found');
    }
    const agentVersionDto = new HnAgentVersionDto(agentVersion);
    const migrator = new HnAgentVersionMigrator();
    return HnAgentForLabDto.fromAgentDto(
      migrator.migrateAgentVersionToSpecificVersion(agentVersionDto, versionNumber).agent
    );
  }

  public async findAllWithFilters(
    spacesFilter: string[],
    titleFilter: string,
    page: number,
    size: number,
    user: HnUser = null,
    personalOnly: boolean = false
  ): Promise<ClPage<HnAgentDto>> {
    const currentUser = user ? user : HnCurrentUserHelper.getCurrentUser();
    let publicSelected = false;
    let myAgentsSelected = false;
    for (const spaceId of spacesFilter) {
      if (spaceId === 'public') publicSelected = true;
      else if (spaceId === 'my-agents') myAgentsSelected = true;
      else await this.spaceAggregateService.assertCheckSpaceUser(spaceId, currentUser.id);
    }
    let userSpacesIds: string[] = null;
    let coAuthorAgentsIds: string[] = [];
    if (currentUser) {
      userSpacesIds = (await this.spaceAggregateService.findSpacesOfUser(currentUser?.id)).map(
        (space) => space.id
      );
      if (myAgentsSelected) {
        coAuthorAgentsIds = (await this.agentCoAuthorService.getAgentCoAuthorsByUserId(currentUser.id)).map(
          (coAuthor) => coAuthor.agent.id
        );
      }
    }

    if (publicSelected) {
      spacesFilter = spacesFilter.filter((spaceId) => spaceId !== 'public');
    }
    if (myAgentsSelected) {
      spacesFilter = spacesFilter.filter((spaceId) => spaceId !== 'my-agents');
    }
    return await this.agentService.findAllWithFiltersPaginated(
      spacesFilter,
      titleFilter,
      publicSelected,
      myAgentsSelected,
      personalOnly,
      page,
      size,
      user,
      userSpacesIds,
      coAuthorAgentsIds
    );
  }

  public async findUserAgents(userId: string, page: number, size: number): Promise<ClPage<HnAgentDto>> {
    const user = await this.userService.findOne(userId);
    if (!user) throw new BlNotFoundException('User not found');
    const currentUser = HnCurrentUserHelper.getCurrentUser();
    let commonSpacesIds: string[] = [];
    if (currentUser) {
      commonSpacesIds = (await this.spaceAggregateService.getUserCommonSpace(userId)).map(
        (space) => space.id
      );
    }
    return await this.agentService.findUserAgents(user, commonSpacesIds, page, size);
  }

  public async getAllAgentsMap(): Promise<HnSitemapItemBase[]> {
    const agents = await this.agentService.findAllWithFilters([], '', true, false, false);
    return agents.map((agent: HnAgent) => ({
      url: this.frontService.getAgentUrl(agent.id, ClStringHelper.getCleanUrlPath(agent.title)),
      priority: 0.8,
      changefreq: HnSiteMapEnumChangefreq.MONTHLY,
      lastmod: agent.lastModifiedAt.toFormat('yyyy-MM-dd'),
    }));
  }

  public async findAll(page: number, size: number): Promise<ClPage<HnAgentDto>> {
    const currentUser = HnCurrentUserHelper.getCurrentUser();
    if (!currentUser) return await this.agentService.findPublicAgent(page, size);

    const userSpaces: HnSpaceDto[] = await this.spaceAggregateService.findSpacesOfCurrentUser();
    return await this.agentService.findAllWithUserSpacesPaginated(userSpaces, page, size);
  }

  /**
   * Check if the user is a lab user and return the user
   * @param req
   */
  private async checkIfLabUserAndReturnUser(req: Request): Promise<HnUser> {
    await this.labConstellabApiService.checkApiKeyAndUserIdInCentral(req);
    const currentUser = await this.userService.findOne(req.header('user'));
    if (!currentUser) throw new BlUnauthorizedException();
    return currentUser;
  }

  public async findAgentById(id: string): Promise<HnAgent> {
    const currentUser = HnCurrentUserHelper.getCurrentUser();

    if (!currentUser) return await this.agentService.findPublicAgentById(id);

    const userSpacesId: string[] = (await this.spaceAggregateService.findSpacesOfCurrentUser()).map(
      (space) => space.id
    );
    const agent = await this.agentService.findAgentByIdWithUserSpaces(id, userSpacesId);
    if (!agent) {
      throw new BlNotFoundException('Agent not found');
    }
    return agent;
  }

  public async findAgentTitleById(id: string): Promise<string> {
    return (await this.findAgentById(id))?.title;
  }

  public async getBrickDependencies(agentId: string): Promise<HnBrickVersionDto[]> {
    const agent = await this.agentService.findOne(agentId);
    const agentVersion = await this.agentVersionService.findLatestByAgent(agent);
    const agentVersionBrickDependencies: HnAgentVersionBrickDependencies[] =
      await this.agentVersionBrickDependenciesService.getBrickVersionDependencies(agentVersion.id);
    return agentVersionBrickDependencies.map(
      (agentVersionBrickDependency) => new HnBrickVersionDto(agentVersionBrickDependency.brickVersion)
    );
  }

  public async deleteAgent(id: string): Promise<void> {
    await this.agentService.checkIfCreatorAndGetAgent(id);
    await this.dataSource.transaction(async (entityManager) => {
      const agentVersions: HnAgentVersion[] = await this.agentVersionService.findAllByAgentId(id);
      for (const agentVersion of agentVersions) {
        await this.agentVersionBrickDependenciesService.deleteByAgentVersionId(
          entityManager,
          agentVersion.id
        );
      }
      await this.agentVersionService.deleteByAgentId(entityManager, id);
      await this.agentService.delete(entityManager, id);
    });
  }

  public async updateStyle(id: string, data: HnAgentEditStyleData): Promise<HnAgentDto> {
    let agent = await this.agentService.checkIfCreatorOrCoAuthorAndGetAgent(id);
    return this.dataSource.transaction(async (entityManager) => {
      agent = await this.agentService.updateLatestStyleWithEntityManager(agent, data.style, entityManager);
      // if not all versions checked, update the latest version
      if (!data.allVersionsChecked || !agent.latestPublishVersion) {
        const version = !agent.latestPublishVersion
          ? await this.agentVersionService.findLatestByAgent(agent)
          : await this.agentVersionService.findLatestPublishedByAgent(agent);
        version.agent = agent;
        await this.agentVersionService.updateStyle(version, data.style, entityManager);
        return new HnAgentDto(agent);
      }

      // update all versions
      const agentVersions = await this.agentVersionService.findAllByAgentId(agent.id);
      for (const agentVersion of agentVersions) {
        if (agent.latestPublishVersion == agentVersion.version) {
          agentVersion.agent = agent;
        }
        await this.agentVersionService.updateStyle(agentVersion, data.style, entityManager);
      }
      return new HnAgentDto(agent);
    });
  }

  //////////////////////////////////////////// Agent Version ////////////////////////////////////////////
  public async findAgentVersionById(id: string): Promise<HnAgentVersionDto> {
    return new HnAgentVersionDto(await this.agentVersionService.findOne(id));
  }

  public async findAgentVersionByAgentIdAndVersionNumber(
    agentId: string,
    versionNumber: number
  ): Promise<HnAgentVersionDto> {
    const version = await this.agentVersionService.findByAgentIdAndVersionNumber(agentId, versionNumber);
    if (version.versionState == HnAgentVersionState.PUBLISHED) {
      return new HnAgentVersionDto(version);
    }

    await this.agentService.checkIfCreatorOrCoAuthorAndGetAgent(agentId);
    return new HnAgentVersionDto(version);
  }

  /**
   * Find the latest version of an agent for lab user
   * @param id
   * @param versionNumber
   */
  public async findLatestPublishedAgentVersionForLabByAgentId(
    id: string,
    versionNumber: number
  ): Promise<HnAgentVersionForLabDto> {
    const user: HnUser = HnCurrentUserHelper.getAndCheckLabInstanceCurrentUser();
    const agent: HnAgent = await this.agentService.findOne(id);
    if (agent.space != null) {
      await this.spaceAggregateService.assertCheckSpaceUser(agent.space.id, user.id);
    }
    const agentVersion = await this.agentVersionService.findLatestPublishedByAgent(agent);
    const agentVersionDto = new HnAgentVersionDto(agentVersion);
    const migrator = new HnAgentVersionMigrator();
    return HnAgentVersionForLabDto.fromAgentVersionDto(
      migrator.migrateAgentVersionToSpecificVersion(agentVersionDto, versionNumber)
    );
  }

  public async findLatestPublishedAgentVersionByAgentId(id: string): Promise<HnAgentVersionDto> {
    const agent: HnAgent = await this.agentService.findOne(id);
    if (agent.space != null) {
      await this.spaceAggregateService.assertCheckSpaceUser(
        agent.space.id,
        HnCurrentUserHelper.getCurrentUser().id
      );
    }
    return new HnAgentVersionDto(await this.agentVersionService.findLatestPublishedByAgent(agent));
  }

  public async updateAgentVersionParams(id: string, params: string): Promise<HnAgentVersion> {
    await this.agentService.checkIfCreatorOrCoAuthorAndGetAgent(
      (await this.agentVersionService.findOne(id)).agent.id
    );
    return this.agentVersionService.updateParams(id, params);
  }

  public async updateAgentVersionCode(id: string, code: string): Promise<HnAgentVersion> {
    await this.agentService.checkIfCreatorOrCoAuthorAndGetAgent(
      (await this.agentVersionService.findOne(id)).agent.id
    );
    return this.agentVersionService.updateCode(id, code);
  }

  public async updateAgentVersionEnvironment(id: string, environment: string): Promise<HnAgentVersion> {
    await this.agentService.checkIfCreatorOrCoAuthorAndGetAgent(
      (await this.agentVersionService.findOne(id)).agent.id
    );
    return this.agentVersionService.updateEnvironment(id, environment);
  }

  public async publishAgentVersion(id: string): Promise<HnAgentVersion> {
    return await this.dataSource.transaction(async (entityManager) => {
      await this.agentService.checkIfCreatorOrCoAuthorAndGetAgent(
        (await this.agentVersionService.findOne(id)).agent.id
      );
      const agentVersion: HnAgentVersion = await this.agentVersionService.publish(id, entityManager);
      agentVersion.agent = await this.agentService.updateAgentLatestPublishVersion(
        agentVersion.agent.id,
        agentVersion,
        entityManager
      );
      return agentVersion;
    });
  }

  public async createNewDraftVersion(
    agentId: string,
    newAgentVersionFile: HnAgentVersionFileInput,
    fromLab: boolean = false
  ): Promise<HnAgentVersion> {
    if (!fromLab) await this.agentService.checkIfCreatorOrCoAuthorAndGetAgent(agentId);
    const agent = await this.agentService.findOne(agentId);
    const latestAgentVersion = await this.agentVersionService.findLatestByAgent(agent);

    if (latestAgentVersion.versionState == 'DRAFT')
      throw new BlBadRequestException('The agent has already a draft version');

    return await this.dataSource.transaction(async (entityManager) => {
      const newAgentVersion = await this.agentVersionService.createNewDraftVersion(
        latestAgentVersion,
        newAgentVersionFile,
        entityManager
      );

      for (const brick of newAgentVersionFile.bricks) {
        const brickVersion: HnBrickVersion = await this.brickAggregateService.getAndCheckBrickVersion(
          brick.name,
          brick.version
        );
        await this.agentVersionBrickDependenciesService.create(newAgentVersion, brickVersion, entityManager);
      }
      return newAgentVersion;
    });
  }

  public async replaceDraftVersion(
    agentId: string,
    newAgentVersionFile: HnAgentVersionFileInput,
    fromLab: boolean = false
  ): Promise<HnAgentVersion> {
    if (!fromLab) await this.agentService.checkIfCreatorOrCoAuthorAndGetAgent(agentId);
    let agent = await this.agentService.findOne(agentId);
    const latestAgentVersion = await this.agentVersionService.findLatestByAgent(agent);

    if (latestAgentVersion?.versionState != 'DRAFT')
      throw new BlBadRequestException('The latest agent version could not be replaced');

    return await this.dataSource.transaction(async (entityManager) => {
      if (latestAgentVersion.version == 1) {
        agent = await this.agentService.updateLatestStyle(agent.id, newAgentVersionFile.style);
      }

      await this.agentVersionService.deleteById(entityManager, latestAgentVersion.id);

      const newAgentVersion = await this.agentVersionService.createNewDraftVersion(
        latestAgentVersion,
        newAgentVersionFile,
        entityManager,
        true
      );

      for (const brick of newAgentVersionFile.bricks) {
        const brickVersion: HnBrickVersion = await this.brickAggregateService.getAndCheckBrickVersion(
          brick.name,
          brick.version
        );
        await this.agentVersionBrickDependenciesService.create(newAgentVersion, brickVersion, entityManager);
      }
      return newAgentVersion;
    });
  }

  public async getPublishedAgentVersions(agentId: string): Promise<HnAgentVersionDto[]> {
    const agent: HnAgent = await this.agentService.findOne(agentId);
    if (BlCurrentUserHelper.getCurrentUser()?.id == agent?.createdBy.id) {
      return (await this.agentVersionService.findAllByAgentId(agentId)).map(
        (agentVersion) => new HnAgentVersionDto(agentVersion)
      );
    }

    const coAuthors = await this.agentCoAuthorService.getAgentCoAuthorsByAgentId(agentId);
    if (coAuthors.some((coAuthor) => coAuthor.user.id == BlCurrentUserHelper.getCurrentUser()?.id))
      return (await this.agentVersionService.findAllByAgentId(agentId)).map(
        (agentVersion) => new HnAgentVersionDto(agentVersion)
      );

    return (await this.agentVersionService.findPublishedByAgentId(agentId)).map(
      (agentVersion) => new HnAgentVersionDto(agentVersion)
    );
  }

  public async updateAgentVersionInfos(
    agentVersionId: string,
    versionInfos: Record<string, any>
  ): Promise<HnAgentVersion> {
    await this.agentService.checkIfCreatorOrCoAuthorAndGetAgent(
      (await this.agentVersionService.findOne(agentVersionId)).agent.id
    );
    return this.agentVersionService.updateVersionInfos(agentVersionId, versionInfos);
  }

  public async getAgentVersionBrickDependencies(agentVersionId: string): Promise<HnBrickVersionDto[]> {
    const agentVersionBrickDependencies: HnAgentVersionBrickDependencies[] =
      await this.agentVersionBrickDependenciesService.getBrickVersionDependencies(agentVersionId);
    return agentVersionBrickDependencies.map(
      (agentVersionBrickDependency) => new HnBrickVersionDto(agentVersionBrickDependency.brickVersion)
    );
  }

  public async updateVersionStyle(versionId: string, data: HnAgentEditStyleData): Promise<HnAgentVersionDto> {
    const version = await this.agentVersionService.findOne(versionId);
    const agent = await this.agentService.checkIfCreatorOrCoAuthorAndGetAgent(version.agent.id);

    return this.dataSource.transaction(async (entityManager) => {
      // if it's the latest version, update the agent latest style
      if (!agent.latestPublishVersion || agent.latestPublishVersion == version.version) {
        version.agent = await this.agentService.updateLatestStyleWithEntityManager(
          agent,
          data.style,
          entityManager
        );
      }
      return new HnAgentVersionDto(
        await this.agentVersionService.updateStyle(version, data.style, entityManager)
      );
    });
  }

  ////////////////////////////////////////// AGENT CO AUTHORS //////////////////////////////////////////
  public async inviteAgentCoAuthor(agentId: string, coAuthorMail: string): Promise<boolean> {
    const agent = await this.agentService.checkIfCreatorAndGetAgent(agentId);
    return this.agentCoAuthorService.inviteAgentCoAuthor(agent, coAuthorMail);
  }

  public async getAgentCoAuthors(agentId: string): Promise<HnUserDto[]> {
    return (await this.agentCoAuthorService.getAgentCoAuthorsByAgentId(agentId)).map(
      (agentCoAuthor) => new HnUserDto(agentCoAuthor.user)
    );
  }

  public async getAgentCoAuthorsPendingInvites(agentId: string): Promise<HnAgentCoAuthorInvite[]> {
    await this.agentService.checkIfCreatorAndGetAgent(agentId);
    return this.agentCoAuthorService.getAgentCoAuthorsPendingInvites(agentId);
  }

  public async removeAgentCoAuthor(id: string, agentCoAuthorUserId: string): Promise<void> {
    await this.agentService.checkIfCreatorAndGetAgent(id);
    return this.agentCoAuthorService.removeAgentCoAuthor(id, agentCoAuthorUserId);
  }

  public async isInviteValid(token: string): Promise<HnAgentCoAuthorInvite> {
    const agentCoAuthorInvite: HnAgentCoAuthorInvite =
      await this.agentCoAuthorService.getAgentCoAuthorInviteByToken(token);
    return agentCoAuthorInvite &&
      agentCoAuthorInvite.status == HnInviteStatus.PENDING &&
      agentCoAuthorInvite.email === HnCurrentUserHelper.getCurrentUser().email
      ? agentCoAuthorInvite
      : null;
  }

  public async acceptInvite(token: string): Promise<HnAgent> {
    const agentCoAuthorInvite: HnAgentCoAuthorInvite = await this.isInviteValid(token);
    if (!agentCoAuthorInvite) throw new Error('Invalid invite');
    const agent = await this.agentService.findOne(agentCoAuthorInvite.agent.id);
    if (
      agent.space &&
      !(await this.spaceAggregateService.checkSpaceUser(
        agent.space.id,
        HnCurrentUserHelper.getCurrentUser().id
      ))
    ) {
      throw new BlUnauthorizedException('User is not in the space of the agent');
    }
    const agentCoAuthor: HnAgentCoAuthor = new HnAgentCoAuthor();
    agentCoAuthor.agent = agent;
    agentCoAuthor.user = HnCurrentUserHelper.getCurrentUser();
    const acceptAgentInvite: boolean = await this.agentCoAuthorService.acceptInvite(
      agentCoAuthor,
      agentCoAuthorInvite
    );
    return acceptAgentInvite ? agent : null;
  }

  public async deleteCoAuthorInvite(inviteId: string): Promise<boolean> {
    return this.agentCoAuthorService.deleteCoAuthorInvite(inviteId);
  }

  public async deleteAgentVersion(id: string): Promise<void> {
    const agentVersion = await this.agentVersionService.findOne(id);
    const agent = await this.agentService.checkIfCreatorOrCoAuthorAndGetAgent(agentVersion.agent.id);

    //Check number of agentVersion
    const agentVersions = await this.agentVersionService.findAllByAgentId(agent.id);
    if (agentVersions.length == 1) {
      throw new BlBadRequestException('The agent must have at least one version');
    }

    await this.dataSource.transaction(async (entityManager) => {
      await this.agentVersionBrickDependenciesService.deleteByAgentVersionId(entityManager, id);
      await this.agentVersionService.deleteById(entityManager, id);
      if (agent.latestPublishVersion == agentVersion.version) {
        const latestVersion = await this.agentVersionService.findSecondLastByAgent(agent);
        await this.agentService.updateAgentLatestPublishVersion(agent.id, latestVersion, entityManager);
      }
    });
  }

  ////////////////////////////////////////// LIKES /////////////////////////////////
  public async addLike(agent: HnAgent, entityManager: EntityManager): Promise<HnAgent> {
    agent.likes++;
    return entityManager.save(agent, { listeners: false });
  }

  public async removeLike(agent: HnAgent, entityManager: EntityManager): Promise<HnAgent> {
    agent.likes--;
    return entityManager.save(agent, { listeners: false });
  }

  ///////////////////////////////////////// COMMENTS ///////////////////////////////
  public async addComment(agent: HnAgent, entityManager: EntityManager): Promise<HnAgent> {
    agent.comments++;
    return entityManager.save(agent, { listeners: false });
  }

  public async removeComment(agent: HnAgent, entityManager: EntityManager): Promise<HnAgent> {
    agent.comments--;
    return entityManager.save(agent, { listeners: false });
  }

  /////////////////////////////////////// FILES  ////////////////////////////////////
  public async saveFile(file: BlFile, agentId: string): Promise<HnUploadFileResponseDto> {
    const agent = await this.agentService.checkIfCreatorOrCoAuthorAndGetAgent(agentId);
    return await this.fileAgentService.saveFile(agent, file);
  }

  public async saveImage(file: BlFile, agentId: string): Promise<BlRichTextUploadedImageResponse> {
    const agent = await this.agentService.checkIfCreatorOrCoAuthorAndGetAgent(agentId);
    return await this.fileAgentService.saveImage(agent, file);
  }

  public async saveView(file: BlFile, agentId: string): Promise<string> {
    const agent = await this.agentService.checkIfCreatorOrCoAuthorAndGetAgent(agentId);
    return await this.fileAgentService.saveResourceView(agent, file);
  }

  /////////////////////////////////////// MIGRATIONS ////////////////////////////////
  public async migrateStyle(): Promise<void> {
    const agents = await this.agentService.getAgentsWithoutLatestStyle();
    const agentVersions = await this.agentVersionService.getAgentVersionWithoutStyle();

    await this.dataSource.transaction(async (entityManager) => {
      for (const agent of agents) {
        agent.latestStyle = baseAgentStyle;
        await entityManager.save(agent);
      }

      for (const agentVersion of agentVersions) {
        agentVersion.style = baseAgentStyle;
        await entityManager.save(agentVersion);
      }
    });
  }
}
