import {
  BlBadRequestException,
  BlFile,
  BlNotFoundException,
  BlSearchSortCriteria,
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
import { HnSpace } from '../space-aggregate/space/hn-space.entity';
import { HnUser } from '../users/hn-user.entity';
import { HnUserService } from '../users/hn-user.service';
import {
  HnAgentDto,
  HnAgentEditStyleData,
  HnAgentForLabDto,
  HnAgentVersionFileInput,
  HnAgentVersionForLabDto,
  HnCreateAgentDto,
  HnCreateAgentVersionFromLabResponseDto,
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
import { HnAgentSecurity } from './security/hn-agent.security';

export interface HnAgentSearchCriteria {
  spacesFilter: string[];
  titleFilter: string;
  sortsCriteria: BlSearchSortCriteria[];
  page: number;
  size: number;
  user?: HnUser | null;
  personalOnly?: boolean;
}

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
    private readonly agentSecurity: HnAgentSecurity,
    private dataSource: DataSource
  ) {}

  public async create(
    createAgentDto: HnCreateAgentDto,
    parentAgentVersionId: string | null = null,
    user: HnUser | null = null
  ): Promise<HnAgentVersion> {
    const currentUser = user ? user : HnCurrentUserHelper.getCurrentUser();
    return await this.dataSource.transaction(async (entityManager) => {
      if (createAgentDto.space != null) {
        if (currentUser == null) {
          throw new BlUnauthorizedException('No user in the context');
        }
        await this.spaceAggregateService.assertCheckSpaceUser(createAgentDto.space.id, currentUser.id);
      }
      const agent: HnAgent = await this.agentService.create(
        createAgentDto,
        entityManager,
        parentAgentVersionId ?? undefined,
        user ?? undefined
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
  ): Promise<HnCreateAgentVersionFromLabResponseDto> {
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
  ): Promise<HnCreateAgentVersionFromLabResponseDto> {
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
  ): Promise<HnCreateAgentVersionFromLabResponseDto> {
    const user = HnCurrentUserHelper.getAndCheckCurrentUser();
    const agent = await this.agentService.findOne(agentId);
    if (agent == null) {
      throw new BlNotFoundException('Agent not found');
    }
    await this.agentSecurity.assertCanEdit(agent, user);
    const newAgentVersion = await this.createNewDraftVersion(agentId, newAgentVersionFile, true, true);
    return {
      id: newAgentVersion.agent.id,
      title: ClStringHelper.getCleanUrlPath(newAgentVersion.agent.title),
      agent_version: newAgentVersion.version.toString(),
    };
  }

  public async updateTitle(id: string, title: string): Promise<HnAgent> {
    const agent = await this.agentService.findOne(id);
    if (agent == null) {
      throw new BlNotFoundException('Agent not found');
    }
    await this.agentSecurity.assertCanEdit(agent, HnCurrentUserHelper.getAndCheckCurrentUser());
    return this.agentService.updateTitle(agent, title);
  }

  public async updateDescription(id: string, description: TeRichText): Promise<HnAgent> {
    const agent = await this.agentService.findOne(id);
    if (agent == null) {
      throw new BlNotFoundException('Agent not found');
    }
    await this.agentSecurity.assertCanEdit(agent, HnCurrentUserHelper.getAndCheckCurrentUser());
    return this.agentService.updateDescription(agent, description);
  }

  public async updateSpace(id: string, spaceId: string): Promise<HnAgent> {
    const agent = await this.agentService.findOne(id);
    if (agent == null) {
      throw new BlNotFoundException('Agent not found');
    }
    await this.agentSecurity.assertCanEdit(agent, HnCurrentUserHelper.getAndCheckCurrentUser());
    let space: HnSpace | null = null;
    if (spaceId) {
      await this.spaceAggregateService.checkIfSpaceExists(spaceId);
      space = await this.spaceAggregateService.findSpaceById(spaceId);
    }
    return this.agentService.updateSpace(agent, space);
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
    return (
      await this.findAllWithFilters({
        spacesFilter: spacesFilter,
        titleFilter: titleFilter,
        sortsCriteria: [],
        page: page,
        size: size,
        user: user,
        personalOnly: personalOnly,
      })
    ).map((agent) => HnAgentForLabDto.fromAgentDto(agent));
  }

  public async getAgentForLabByVersionId(
    versionId: string,
    versionNumber: number
  ): Promise<HnAgentForLabDto> {
    const user = HnCurrentUserHelper.getAndCheckCurrentUser();
    const agentVersion: HnAgentVersion | null = await this.agentVersionService.findOne(versionId);
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
    const agentVersion: HnAgentVersion | null = await this.agentVersionService.findOne(versionId);
    if (agentVersion == null || agentVersion.agent == null) {
      throw new BlNotFoundException('Agent not found');
    }
    const agent = await this.agentService.findOne(agentVersion.agent.id);
    if (agent == null) {
      throw new BlNotFoundException('Agent not found');
    }
    await this.agentSecurity.assertCanView(agent, user);
    await this.agentSecurity.assertCanEdit(agent, user);
    const migrator = new HnAgentVersionMigrator();
    const agentDto = migrator.migrateAgentVersionToSpecificVersion(
      new HnAgentVersionDto(agentVersion),
      versionNumber
    ).agent;
    agentDto.agentCoAuthors = agent.agentCoAuthors;
    return HnAgentForLabDto.fromAgentDto(agentDto);
  }

  public async findAllWithFilters(criteria: HnAgentSearchCriteria): Promise<ClPage<HnAgentDto>> {
    const currentUser = criteria.user ? criteria.user : HnCurrentUserHelper.getCurrentUser();
    const { publicSelected, myAgentsSelected } = await this.resolveSpacesSelection(
      criteria.spacesFilter,
      currentUser
    );
    const { userSpacesIds, coAuthorAgentsIds } = await this.findUserSpacesAndCoAuthorAgentsIds(
      currentUser,
      myAgentsSelected
    );

    let spacesFilter = criteria.spacesFilter;
    if (publicSelected) {
      spacesFilter = spacesFilter.filter((spaceId) => spaceId !== 'public');
    }
    if (myAgentsSelected) {
      spacesFilter = spacesFilter.filter((spaceId) => spaceId !== 'my-agents');
    }
    return await this.agentService.findAllWithFiltersPaginated(
      {
        spacesFilter: spacesFilter,
        titleFilter: criteria.titleFilter,
        publicSelected: publicSelected,
        myAgentsSelected: myAgentsSelected,
        personalOnly: criteria.personalOnly ?? false,
        user: criteria.user ?? null,
        userSpacesIds: userSpacesIds,
        coAuthorAgentsIds: coAuthorAgentsIds,
      },
      criteria.page,
      criteria.size,
      criteria.sortsCriteria
    );
  }

  /**
   * Read the 'public' and 'my-agents' pseudo spaces of the filter and check the access to the real ones
   */
  private async resolveSpacesSelection(
    spacesFilter: string[],
    currentUser: HnUser | null
  ): Promise<{ publicSelected: boolean; myAgentsSelected: boolean }> {
    let publicSelected = false;
    let myAgentsSelected = false;
    for (const spaceId of spacesFilter) {
      if (spaceId === 'public') publicSelected = true;
      else if (spaceId === 'my-agents') myAgentsSelected = true;
      else {
        if (currentUser == null) {
          throw new BlUnauthorizedException('No user in the context');
        }
        await this.spaceAggregateService.assertCheckSpaceUser(spaceId, currentUser.id);
      }
    }
    return { publicSelected, myAgentsSelected };
  }

  private async findUserSpacesAndCoAuthorAgentsIds(
    currentUser: HnUser | null,
    myAgentsSelected: boolean
  ): Promise<{ userSpacesIds: string[] | null; coAuthorAgentsIds: string[] }> {
    let userSpacesIds: string[] | null = null;
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
    return { userSpacesIds, coAuthorAgentsIds };
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
    const agents = await this.agentService.findAllWithFilters({
      spacesFilter: [],
      titleFilter: '',
      publicSelected: true,
      myAgentsSelected: false,
      personalOnly: false,
    });
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

    if (!currentUser) {
      const publicAgent = await this.agentService.findPublicAgentById(id);
      if (publicAgent == null) {
        throw new BlNotFoundException('Agent not found');
      }
      return publicAgent;
    }

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
    const agent = await this.agentService.findOne(id);
    if (agent == null) {
      throw new BlNotFoundException('Agent not found');
    }
    const user = HnCurrentUserHelper.getAndCheckCurrentUser();
    this.agentSecurity.assertIsCreator(agent, user);
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
    const foundAgent = await this.agentService.findOne(id);
    if (foundAgent == null) {
      throw new BlNotFoundException('Agent not found');
    }
    await this.agentSecurity.assertCanEdit(foundAgent, HnCurrentUserHelper.getAndCheckCurrentUser());
    return this.dataSource.transaction(async (entityManager) => {
      let agent = foundAgent;
      agent = await this.agentService.updateLatestStyleWithEntityManager(agent, data.style, entityManager);
      // if not all versions checked, update the latest version
      if (!data.allVersionsChecked || !agent.latestPublishVersion) {
        const version = !agent.latestPublishVersion
          ? await this.agentVersionService.findLatestByAgent(agent)
          : await this.agentVersionService.findLatestPublishedByAgent(agent);
        if (version == null) {
          throw new BlNotFoundException('Agent version not found');
        }
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
    if (agent == null) {
      throw new BlNotFoundException('Agent not found');
    }
    const user = HnCurrentUserHelper.getCurrentUser();
    if (user) {
      await this.agentSecurity.assertCanView(agent, user);
    } else if (agent.space) {
      throw new BlUnauthorizedException();
    }
  }

  //////////////////////////////////////////// Agent Version ////////////////////////////////////////////
  public async findAgentVersionById(id: string): Promise<HnAgentVersion> {
    const agentVersion = await this.agentVersionService.findOne(id);
    if (agentVersion == null) {
      throw new BlNotFoundException('Agent version not found');
    }
    return agentVersion;
  }

  public async assertCheckAgentVersionUser(agentVersionId: string): Promise<void> {
    const agentVersion = await this.agentVersionService.findOne(agentVersionId);
    if (agentVersion == null) {
      throw new BlNotFoundException('Agent version not found');
    }
    const user = HnCurrentUserHelper.getCurrentUser();
    if (user) {
      await this.agentSecurity.assertCanView(agentVersion.agent, user);
    } else if (agentVersion.agent.space) {
      throw new BlUnauthorizedException();
    }
  }

  private async assertCanEditAgentVersion(agentVersionId: string): Promise<void> {
    const agentVersion = await this.agentVersionService.findOne(agentVersionId);
    if (agentVersion == null) {
      throw new BlNotFoundException('Agent version not found');
    }
    const agent = await this.agentService.findOne(agentVersion.agent.id);
    if (agent == null) {
      throw new BlNotFoundException('Agent not found');
    }
    await this.agentSecurity.assertCanEdit(agent, HnCurrentUserHelper.getAndCheckCurrentUser());
  }

  public async findAgentVersionByAgentIdAndVersionNumber(
    agentId: string,
    versionNumber: number
  ): Promise<HnAgentVersion> {
    const version = await this.agentVersionService.findByAgentIdAndVersionNumber(agentId, versionNumber);
    if (version == null) {
      throw new BlNotFoundException('Agent version not found');
    }
    if (version.versionState == HnAgentVersionState.PUBLISHED) {
      return version;
    }

    const agent = await this.agentService.findOne(agentId);
    if (agent == null) {
      throw new BlNotFoundException('Agent not found');
    }
    await this.agentSecurity.assertCanEdit(agent, HnCurrentUserHelper.getAndCheckCurrentUser());
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
    const agent = await this.agentService.findOne(id);
    if (agent == null) {
      throw new BlNotFoundException('Agent not found');
    }
    if (agent.space != null) {
      await this.spaceAggregateService.assertCheckSpaceUser(agent.space.id, user.id);
    }
    const agentVersion = await this.agentVersionService.findLatestPublishedByAgent(agent);
    if (agentVersion == null) {
      throw new BlNotFoundException('Agent version not found');
    }
    const agentVersionDto = new HnAgentVersionDto(agentVersion);
    const migrator = new HnAgentVersionMigrator();
    return HnAgentVersionForLabDto.fromAgentVersionDto(
      migrator.migrateAgentVersionToSpecificVersion(agentVersionDto, versionNumber)
    );
  }

  public async findLatestPublishedAgentVersionByAgentId(id: string): Promise<HnAgentVersion> {
    const agent = await this.agentService.findOne(id);
    if (agent == null) {
      throw new BlNotFoundException('Agent not found');
    }
    if (agent.space != null) {
      await this.spaceAggregateService.assertCheckSpaceUser(
        agent.space.id,
        HnCurrentUserHelper.getAndCheckCurrentUser().id
      );
    }
    const agentVersion = await this.agentVersionService.findLatestPublishedByAgent(agent);
    if (agentVersion == null) {
      throw new BlNotFoundException('Agent version not found');
    }
    return agentVersion;
  }

  public async updateAgentVersionParams(id: string, params: Record<string, any>): Promise<HnAgentVersion> {
    await this.assertCanEditAgentVersion(id);
    return this.agentVersionService.updateParams(id, params);
  }

  public async updateAgentVersionCode(id: string, code: string): Promise<HnAgentVersion> {
    await this.assertCanEditAgentVersion(id);
    return this.agentVersionService.updateCode(id, code);
  }

  public async updateAgentVersionEnvironment(id: string, environment: string): Promise<HnAgentVersion> {
    await this.assertCanEditAgentVersion(id);
    return this.agentVersionService.updateEnvironment(id, environment);
  }

  public async publishAgentVersion(id: string): Promise<HnAgentVersion> {
    return await this.dataSource.transaction(async (entityManager) => {
      await this.assertCanEditAgentVersion(id);
      const agentVersion: HnAgentVersion = await this.agentVersionService.publish(id, entityManager);
      agentVersion.agent = await this.agentService.updateAgentLatestPublishVersion(
        agentVersion.agent,
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
    const agent = await this.agentService.findOne(agentId);
    if (agent == null) {
      throw new BlNotFoundException('Agent not found');
    }
    if (!fromLab) await this.agentSecurity.assertCanEdit(agent, HnCurrentUserHelper.getAndCheckCurrentUser());

    return await this.dataSource.transaction(async (entityManager) => {
      let latestAgentVersion = await this.agentVersionService.findLatestByAgent(agent);
      if (latestAgentVersion == null) {
        throw new BlNotFoundException('Agent version not found');
      }

      if (latestAgentVersion.versionState == HnAgentVersionState.DRAFT) {
        if (replaceDraft) {
          await this.agentVersionService.deleteById(entityManager, latestAgentVersion.id);
          latestAgentVersion = await this.agentVersionService.findSecondLastByAgent(agent);
          if (latestAgentVersion == null) {
            throw new BlNotFoundException('Agent version not found');
          }
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
    const foundAgent = await this.agentService.findOne(agentId);
    if (foundAgent == null) {
      throw new BlNotFoundException('Agent not found');
    }
    if (!fromLab)
      await this.agentSecurity.assertCanEdit(foundAgent, HnCurrentUserHelper.getAndCheckCurrentUser());
    const latestAgentVersion = await this.agentVersionService.findLatestByAgent(foundAgent);

    if (latestAgentVersion?.versionState != HnAgentVersionState.DRAFT)
      throw new BlBadRequestException('The latest agent version could not be replaced');

    return await this.dataSource.transaction(async (entityManager) => {
      if (latestAgentVersion.version == 1) {
        await this.agentService.updateLatestStyle(foundAgent.id, newAgentVersionFile.style);
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
    const agent = await this.agentService.findOne(agentId);
    if (agent == null) {
      throw new BlNotFoundException('Agent not found');
    }
    const user = HnCurrentUserHelper.getCurrentUser();
    if (user && (await this.agentSecurity.isCreatorOrCoAuthor(agent, user))) {
      return this.agentVersionService.findAllByAgentId(agentId);
    }
    return await this.agentVersionService.findPublishedByAgentId(agentId);
  }

  public async updateAgentVersionInfos(
    agentVersionId: string,
    versionInfos: TeRichText
  ): Promise<HnAgentVersion> {
    await this.assertCanEditAgentVersion(agentVersionId);
    return this.agentVersionService.updateVersionInfos(agentVersionId, versionInfos);
  }

  public async getAgentVersionBrickDependencies(
    agentVersionId: string
  ): Promise<HnAgentVersionBrickDependencies[]> {
    return this.agentVersionBrickDependenciesService.getBrickVersionDependencies(agentVersionId);
  }

  public async updateVersionStyle(versionId: string, data: HnAgentEditStyleData): Promise<HnAgentVersion> {
    const version = await this.agentVersionService.findOne(versionId);
    if (version == null) {
      throw new BlNotFoundException('Agent version not found');
    }
    const agent = await this.agentService.findOne(version.agent.id);
    if (agent == null) {
      throw new BlNotFoundException('Agent not found');
    }
    await this.agentSecurity.assertCanEdit(agent, HnCurrentUserHelper.getAndCheckCurrentUser());

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
    const agent = await this.agentService.findOne(agentId);
    if (agent == null) {
      throw new BlNotFoundException('Agent not found');
    }
    this.agentSecurity.assertIsCreator(agent, HnCurrentUserHelper.getAndCheckCurrentUser());
    return this.agentCoAuthorService.inviteAgentCoAuthor(agent, emailOrId);
  }

  public async getAgentCoAuthors(agentId: string): Promise<HnAgentCoAuthor[]> {
    return this.agentCoAuthorService.getAgentCoAuthorsByAgentId(agentId);
  }

  public async getAgentCoAuthorsPendingInvites(agentId: string): Promise<HnAgentCoAuthorInvite[]> {
    const agent = await this.agentService.findOne(agentId);
    if (agent == null) {
      throw new BlNotFoundException('Agent not found');
    }
    this.agentSecurity.assertIsCreator(agent, HnCurrentUserHelper.getAndCheckCurrentUser());
    return this.agentCoAuthorService.getAgentCoAuthorsPendingInvites(agentId);
  }

  public async removeAgentCoAuthor(id: string, agentCoAuthorUserId: string): Promise<void> {
    const agent = await this.agentService.findOne(id);
    if (agent == null) {
      throw new BlNotFoundException('Agent not found');
    }
    this.agentSecurity.assertIsCreator(agent, HnCurrentUserHelper.getAndCheckCurrentUser());
    return this.agentCoAuthorService.removeAgentCoAuthor(id, agentCoAuthorUserId);
  }

  public async isInviteValid(token: string): Promise<HnAgentCoAuthorInvite | null> {
    const agentCoAuthorInvite: HnAgentCoAuthorInvite =
      await this.agentCoAuthorService.getAgentCoAuthorInviteByToken(token);
    return agentCoAuthorInvite &&
      agentCoAuthorInvite.status == HnInviteStatus.PENDING &&
      agentCoAuthorInvite.email === HnCurrentUserHelper.getCurrentUser()?.email
      ? agentCoAuthorInvite
      : null;
  }

  public async acceptInvite(token: string): Promise<HnAgent | null> {
    const agentCoAuthorInvite = await this.isInviteValid(token);
    if (!agentCoAuthorInvite) throw new BlNotFoundException('Invalid invite');
    const agent = await this.agentService.findOne(agentCoAuthorInvite.agent.id);
    if (agent == null) {
      throw new BlNotFoundException('Agent not found');
    }
    if (
      agent.space &&
      !(await this.spaceAggregateService.checkSpaceUser(
        agent.space.id,
        HnCurrentUserHelper.getAndCheckCurrentUser().id
      ))
    ) {
      throw new BlUnauthorizedException('User is not in the space of the agent');
    }
    const agentCoAuthor: HnAgentCoAuthor = new HnAgentCoAuthor();
    agentCoAuthor.agent = agent;
    agentCoAuthor.user = HnCurrentUserHelper.getAndCheckCurrentUser();
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
    if (agentVersion == null) {
      throw new BlNotFoundException('Agent version not found');
    }
    const agent = await this.agentService.findOne(agentVersion.agent.id);
    if (agent == null) {
      throw new BlNotFoundException('Agent not found');
    }
    await this.agentSecurity.assertCanEdit(agent, HnCurrentUserHelper.getAndCheckCurrentUser());

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
        if (latestVersion == null) {
          throw new BlNotFoundException('Agent version not found');
        }
        await this.agentService.updateAgentLatestPublishVersion(agent, latestVersion, entityManager);
      }
    });
  }

  /////////////////////////////////////// FILES  ////////////////////////////////////
  public async saveFile(file: BlFile, agentId: string): Promise<HnUploadFileResponseDto> {
    const agent = await this.agentService.findOne(agentId);
    if (agent == null) {
      throw new BlNotFoundException('Agent not found');
    }
    await this.agentSecurity.assertCanEdit(agent, HnCurrentUserHelper.getAndCheckCurrentUser());
    return await this.fileAgentService.saveFile(agent, file);
  }

  public async saveImage(file: BlFile, agentId: string): Promise<TeBlockFigureUploadedResponse> {
    const agent = await this.agentService.findOne(agentId);
    if (agent == null) {
      throw new BlNotFoundException('Agent not found');
    }
    await this.agentSecurity.assertCanEdit(agent, HnCurrentUserHelper.getAndCheckCurrentUser());
    return await this.fileAgentService.saveImage(agent, file);
  }

  public async saveView(file: BlFile, agentId: string): Promise<string> {
    const agent = await this.agentService.findOne(agentId);
    if (agent == null) {
      throw new BlNotFoundException('Agent not found');
    }
    await this.agentSecurity.assertCanEdit(agent, HnCurrentUserHelper.getAndCheckCurrentUser());
    return await this.fileAgentService.saveResourceView(agent, file);
  }
}
