import {
  BlBadRequestException,
  BlFile,
  BlNotFoundException,
  BlUnauthorizedException,
} from '@monorepo/back-core-lib';
import { ClPage, ClStringHelper } from '@monorepo/core-lib';
import { TeBlockFigureUploadedResponse, TeRichText } from '@monorepo/te-text-editor';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { HnBrickVersion } from '../brick-aggregate/brick-version/hn-brick-version.entity';
import { HnBrickAggregateService } from '../brick-aggregate/hn-brick-aggregate.service';
import { HnInviteStatus } from '../core/model/config/hn-invite-status.enum';
import { HnSiteMapEnumChangefreq, HnSitemapItemBase } from '../core/model/config/hn-site-map.class';
import { HnFrontService } from '../core/service/hn-front.service';
import { HnCurrentUserHelper } from '../core/utils/hn-current-user.helper';
import { HnFileAgentService } from '../file-aggregate/file-agent/hn-file-agent.service';
import { HnUploadFileResponseDto } from '../file-aggregate/file-core/hn-abstract-file.dto';
import { HnSpaceAggregateService } from '../space-aggregate/hn-space-aggregate.service';
import { HnSpaceDto } from '../space-aggregate/space/hn-space.dto';
import { HnUser } from '../users/hn-user.entity';
import { HnUserService } from '../users/hn-user.service';
import {
  HaCreateAgentVersionFromLabResponseDto,
  HnAgentDto,
  HnAgentEditStyleData,
  HnAgentForLabDto,
  HnAgentVersionFileInput,
  HnAgentVersionForLabDto,
  HnCreateAgentDto,
} from './agent/hn-agent.dto';
import { HnAgent } from './agent/hn-agent.entity';
import { HnAgentService } from './agent/hn-agent.service';
import { HnAgentCoAuthor } from './agent-co-author/hn-agent-co-author.entity';
import { HnAgentCoAuthorService } from './agent-co-author/hn-agent-co-author.service';
import { HnAgentCoAuthorInvite } from './agent-co-author-invite/hn-agent-co-author-invite.entity';
import { HnAgentVersionDto } from './agent-version/hn-agent-version.dto';
import { HnAgentVersion, HnAgentVersionState } from './agent-version/hn-agent-version.entity';
import { HnAgentVersionService } from './agent-version/hn-agent-version.service';
import { HnAgentVersionMigrator } from './agent-version/hn-agent-version-migrator.class';
import { HnAgentVersionBrickDependencies } from './agent-version-brick-dependencies/hn-agent-version-brick-dependencies.entity';
import { HnAgentVersionBrickDependenciesService } from './agent-version-brick-dependencies/hn-agent-version-brick-dependencies.service';

@Injectable()
export class HnAgentAggregateService {
  constructor(
    private readonly agentService: HnAgentService,
    private readonly agentVersionService: HnAgentVersionService,
    private readonly agentVersionBrickDependenciesService: HnAgentVersionBrickDependenciesService,
    private readonly spaceAggregateService: HnSpaceAggregateService,
    private readonly brickAggregateService: HnBrickAggregateService,
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
    const user = HnCurrentUserHelper.getAndCheckCurrentUser();
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
    const user = HnCurrentUserHelper.getAndCheckCurrentUser();
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
    const user = HnCurrentUserHelper.getAndCheckCurrentUser();
    const agent: HnAgent = await this.agentService.findOne(agentId);

    if (agent.createdBy.id != user.id) {
      const coAuthors = await this.agentCoAuthorService.getAgentCoAuthorsByAgentId(agentId);
      if (!coAuthors.some((coAuthor) => coAuthor.user.id == user.id)) throw new BlUnauthorizedException();
    }
    const newAgentVersion = await this.createNewDraftVersion(agentId, newAgentVersionFile, true, true);
    return {
      id: newAgentVersion.agent.id,
      title: ClStringHelper.getCleanUrlPath(newAgentVersion.agent.title),
      agent_version: newAgentVersion.version.toString(),
    };
  }

  public async updateTitle(id: string, title: string): Promise<HnAgent> {
    return this.agentService.updateTitle(id, title);
  }

  public async updateDescription(id: string, description: TeRichText): Promise<HnAgent> {
    return this.agentService.updateDescription(id, description);
  }

  public async findPublic(): Promise<HnAgent[]> {
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
    const user = HnCurrentUserHelper.getAndCheckCurrentUser();
    return (await this.findAllWithFilters(spacesFilter, titleFilter, page, size, user, personalOnly)).map(
      (agent) => HnAgentForLabDto.fromAgentDto(agent)
    );
  }

  public async getAgentForLabByVersionId(
    versionId: string,
    versionNumber: number
  ): Promise<HnAgentForLabDto> {
    const user = HnCurrentUserHelper.getAndCheckCurrentUser();
    const agentVersion: HnAgentVersion = await this.agentVersionService.findOne(versionId);
    if (agentVersion == null || agentVersion.agent == null) {
      throw new BlNotFoundException('Agent not found');
    }
    if (agentVersion.agent.space != null) {
      await this.spaceAggregateService.assertCheckSpaceUser(agentVersion.agent.space.id, user.id);
    }
    const agentVersionDto = new HnAgentVersionDto(agentVersion);
    const migrator = new HnAgentVersionMigrator();
    return HnAgentForLabDto.fromAgentDto(
      migrator.migrateAgentVersionToSpecificVersion(agentVersionDto, versionNumber).agent
    );
  }

  public async getAgentForLabAndCheckRights(
    versionId: string,
    versionNumber: number
  ): Promise<HnAgentForLabDto> {
    const user = HnCurrentUserHelper.getAndCheckCurrentUser();
    const agentVersion: HnAgentVersion = await this.agentVersionService.findOne(versionId);
    const agent = await this.agentService.findOne(agentVersion?.agent.id);
    if (agent == null) {
      throw new BlNotFoundException('Agent not found');
    }
    if (agent.space != null) {
      await this.spaceAggregateService.assertCheckSpaceUser(agent.space.id, user.id);
    }
    const coAuthors = await this.getAgentCoAuthors(agent.id);
    if (user.id == agent.createdBy.id || coAuthors.some((coAuthor) => coAuthor.user.id == user.id)) {
      const migrator = new HnAgentVersionMigrator();
      const agentDto = migrator.migrateAgentVersionToSpecificVersion(
        new HnAgentVersionDto(agentVersion),
        versionNumber
      ).agent;
      agentDto.agentCoAuthors = agent.agentCoAuthors;
      return HnAgentForLabDto.fromAgentDto(agentDto);
    }

    throw new BlUnauthorizedException('You are not allowed to access this agent');
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
      else await this.spaceAggregateService.assertCheckSpaceUser(spaceId, currentUser?.id);
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
    const agentVersions: HnAgentVersion[] = [];
    const agentsMap: HnSitemapItemBase[] = [];
    for (const agent of agents) {
      agentsMap.push({
        url: this.frontService.getAgentUrl(agent.id, ClStringHelper.getCleanUrlPath(agent.title)),
        priority: 0.8,
        changefreq: HnSiteMapEnumChangefreq.MONTHLY,
        lastmod: agent.lastModifiedAt.toFormat('yyyy-MM-dd'),
      });

      agentVersions.push(...(await this.agentVersionService.findPublishedByAgentId(agent.id)));
    }

    for (const agentVersion of agentVersions) {
      agentsMap.push({
        url: this.frontService.getAgentVersionUrl(
          agentVersion.agent.id,
          ClStringHelper.getCleanUrlPath(agentVersion.agent.title),
          agentVersion.version
        ),
        priority: 0.8,
        changefreq: HnSiteMapEnumChangefreq.MONTHLY,
      });
    }

    return agentsMap;
  }

  public async findAll(page: number, size: number): Promise<ClPage<HnAgentDto>> {
    const currentUser = HnCurrentUserHelper.getCurrentUser();
    if (!currentUser) return await this.agentService.findPublicAgent(page, size);

    const userSpaces: HnSpaceDto[] = await this.spaceAggregateService.findSpacesOfCurrentUser();
    return await this.agentService.findAllWithUserSpacesPaginated(userSpaces, page, size);
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

  public async updateStyle(id: string, data: HnAgentEditStyleData): Promise<HnAgent> {
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
        return agent;
      }

      // update all versions
      const agentVersions = await this.agentVersionService.findAllByAgentId(agent.id);
      for (const agentVersion of agentVersions) {
        if (agent.latestPublishVersion == agentVersion.version) {
          agentVersion.agent = agent;
        }
        await this.agentVersionService.updateStyle(agentVersion, data.style, entityManager);
      }
      return agent;
    });
  }

  public async assertCheckAgentUser(agentId: string): Promise<void> {
    const agent = await this.agentService.findOne(agentId);
    if (agent.space != null) {
      await this.spaceAggregateService.assertCheckSpaceUser(
        agent.space.id,
        HnCurrentUserHelper.getCurrentUser().id
      );
    }
  }

  //////////////////////////////////////////// Agent Version ////////////////////////////////////////////
  public async findAgentVersionById(id: string): Promise<HnAgentVersion> {
    return await this.agentVersionService.findOne(id);
  }

  public async assertCheckAgentVersionUser(agentVersionId: string): Promise<void> {
    const agentVersion = await this.agentVersionService.findOne(agentVersionId);
    if (agentVersion.agent.space != null) {
      await this.spaceAggregateService.assertCheckSpaceUser(
        agentVersion.agent.space.id,
        HnCurrentUserHelper.getCurrentUser().id
      );
    }
  }

  public async findAgentVersionByAgentIdAndVersionNumber(
    agentId: string,
    versionNumber: number
  ): Promise<HnAgentVersion> {
    const version = await this.agentVersionService.findByAgentIdAndVersionNumber(agentId, versionNumber);
    if (version.versionState == HnAgentVersionState.PUBLISHED) {
      return version;
    }

    await this.agentService.checkIfCreatorOrCoAuthorAndGetAgent(agentId);
    return version;
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
    const user: HnUser = HnCurrentUserHelper.getAndCheckCurrentUser();
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

  public async findLatestPublishedAgentVersionByAgentId(id: string): Promise<HnAgentVersion> {
    const agent: HnAgent = await this.agentService.findOne(id);
    if (agent.space != null) {
      await this.spaceAggregateService.assertCheckSpaceUser(
        agent.space.id,
        HnCurrentUserHelper.getCurrentUser().id
      );
    }
    return this.agentVersionService.findLatestPublishedByAgent(agent);
  }

  public async updateAgentVersionParams(id: string, params: Record<string, any>): Promise<HnAgentVersion> {
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
    fromLab: boolean = false,
    replaceDraft: boolean = false
  ): Promise<HnAgentVersion> {
    if (!fromLab) await this.agentService.checkIfCreatorOrCoAuthorAndGetAgent(agentId);
    const agent = await this.agentService.findOne(agentId);

    return await this.dataSource.transaction(async (entityManager) => {
      let latestAgentVersion = await this.agentVersionService.findLatestByAgent(agent);

      if (latestAgentVersion.versionState == HnAgentVersionState.DRAFT) {
        if (replaceDraft) {
          await this.agentVersionService.deleteById(entityManager, latestAgentVersion.id);
          latestAgentVersion = await this.agentVersionService.findSecondLastByAgent(agent);
        } else {
          throw new BlBadRequestException('The agent has already a draft version');
        }
      }

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

    if (latestAgentVersion?.versionState != HnAgentVersionState.DRAFT)
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

  public async getPublishedAgentVersions(agentId: string): Promise<HnAgentVersion[]> {
    const agent: HnAgent = await this.agentService.findOne(agentId);
    if (HnCurrentUserHelper.getCurrentUser()?.id == agent?.createdBy.id) {
      return this.agentVersionService.findAllByAgentId(agentId);
    }

    const coAuthors = await this.agentCoAuthorService.getAgentCoAuthorsByAgentId(agentId);
    if (coAuthors.some((coAuthor) => coAuthor.user.id == HnCurrentUserHelper.getCurrentUser()?.id))
      return this.agentVersionService.findAllByAgentId(agentId);

    return await this.agentVersionService.findPublishedByAgentId(agentId);
  }

  public async updateAgentVersionInfos(
    agentVersionId: string,
    versionInfos: TeRichText
  ): Promise<HnAgentVersion> {
    await this.agentService.checkIfCreatorOrCoAuthorAndGetAgent(
      (await this.agentVersionService.findOne(agentVersionId)).agent.id
    );
    return this.agentVersionService.updateVersionInfos(agentVersionId, versionInfos);
  }

  public async getAgentVersionBrickDependencies(
    agentVersionId: string
  ): Promise<HnAgentVersionBrickDependencies[]> {
    return this.agentVersionBrickDependenciesService.getBrickVersionDependencies(agentVersionId);
  }

  public async updateVersionStyle(versionId: string, data: HnAgentEditStyleData): Promise<HnAgentVersion> {
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
      return this.agentVersionService.updateStyle(version, data.style, entityManager);
    });
  }

  ////////////////////////////////////////// AGENT CO AUTHORS //////////////////////////////////////////
  public async inviteAgentCoAuthor(agentId: string, emailOrId: string): Promise<boolean> {
    const agent = await this.agentService.checkIfCreatorAndGetAgent(agentId);
    return this.agentCoAuthorService.inviteAgentCoAuthor(agent, emailOrId);
  }

  public async getAgentCoAuthors(agentId: string): Promise<HnAgentCoAuthor[]> {
    return this.agentCoAuthorService.getAgentCoAuthorsByAgentId(agentId);
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
      agentCoAuthorInvite.email === HnCurrentUserHelper.getCurrentUser()?.email
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

  /////////////////////////////////////// FILES  ////////////////////////////////////
  public async saveFile(file: BlFile, agentId: string): Promise<HnUploadFileResponseDto> {
    const agent = await this.agentService.checkIfCreatorOrCoAuthorAndGetAgent(agentId);
    return await this.fileAgentService.saveFile(agent, file);
  }

  public async saveImage(file: BlFile, agentId: string): Promise<TeBlockFigureUploadedResponse> {
    const agent = await this.agentService.checkIfCreatorOrCoAuthorAndGetAgent(agentId);
    return await this.fileAgentService.saveImage(agent, file);
  }

  public async saveView(file: BlFile, agentId: string): Promise<string> {
    const agent = await this.agentService.checkIfCreatorOrCoAuthorAndGetAgent(agentId);
    return await this.fileAgentService.saveResourceView(agent, file);
  }
}
