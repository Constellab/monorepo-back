import {
  BlAbstractPaginatedService,
  BlSearchSortCriteria,
  BlUnauthorizedException,
} from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import { TeRichText } from '@monorepo/te-text-editor';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, In, IsNull, Like, Not, Repository } from 'typeorm';

import { HnTypingStyle } from '../../brick-aggregate/brick/hn-brick.dto';
import { HnCurrentUserHelper } from '../../core/utils/hn-current-user.helper';
import { HnSpaceDto } from '../../space-aggregate/space/hn-space.dto';
import { HnUser } from '../../users/hn-user.entity';
import { HnAgentCoAuthorService } from '../agent-co-author/hn-agent-co-author.service';
import { HnAgentVersion } from '../agent-version/hn-agent-version.entity';
import { HnAgentDto, HnCreateAgentDto } from './hn-agent.dto';
import { HnAgent } from './hn-agent.entity';

@Injectable()
export class HnAgentService {
  constructor(
    @InjectRepository(HnAgent)
    private agentRepository: Repository<HnAgent>,
    private agentCoAuthorService: HnAgentCoAuthorService
  ) {}

  public async findPublic(): Promise<HnAgent[]> {
    return this.agentRepository.find({
      where: {
        space: IsNull(),
        latestPublishVersion: Not(IsNull()),
      },
    });
  }

  public async findOne(id: string): Promise<HnAgent> {
    return this.agentRepository.findOneBy({ id: id });
  }

  public async findAllWithUserSpacesPaginated(
    userSpaces: HnSpaceDto[],
    page: number,
    size: number
  ): Promise<ClPage<HnAgentDto>> {
    return (
      await BlAbstractPaginatedService.findPaginatedStatic(
        page,
        size,
        {
          where: [
            {
              space: {
                id: In(userSpaces.map((space) => space.id)),
              },
              latestPublishVersion: Not(IsNull()),
            },
            {
              space: IsNull(),
              latestPublishVersion: Not(IsNull()),
            },
          ],
          order: { createdAt: 'DESC' as any },
        },
        this.agentRepository.manager,
        HnAgent
      )
    ).map((agent: HnAgent) => new HnAgentDto(agent));
  }

  public async findPublicAgent(page: number, size: number): Promise<ClPage<HnAgentDto>> {
    return (
      await BlAbstractPaginatedService.findPaginatedStatic(
        page,
        size,
        {
          where: [
            {
              space: IsNull(),
              latestPublishVersion: Not(IsNull()),
            },
          ],
          order: { createdAt: 'DESC' as any },
        },
        this.agentRepository.manager,
        HnAgent
      )
    ).map((agent) => new HnAgentDto(agent));
  }

  public async findAgentByIdWithUserSpaces(id: string, userSpacesId: string[]): Promise<HnAgent> {
    return this.agentRepository.findOne({
      where: [
        {
          id: id,
          space: {
            id: In(userSpacesId),
          },
        },
        {
          id: id,
          space: IsNull(),
        },
      ],
    });
  }

  public buildFindWhereWithFilters(
    spacesFilter: string[],
    titleFilter: string,
    publicSelected: boolean,
    myAgentsSelected: boolean,
    personalOnly: boolean,
    user: HnUser,
    userSpacesIds: string[],
    coAuthorAgentsIds: string[]
  ): FindOptionsWhere<HnAgent>[] {
    let where: FindOptionsWhere<HnAgent>[];
    const currentUser = user ? user : HnCurrentUserHelper.getCurrentUser();

    if (currentUser == null) {
      where = [
        {
          space: {
            id: IsNull(),
          },
          latestPublishVersion: Not(IsNull()),
        },
      ];
    } else if (publicSelected && myAgentsSelected) {
      where = [
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
          id: In(coAuthorAgentsIds),
        },
        {
          space: {
            id: IsNull(),
          },
          id: In(coAuthorAgentsIds),
        },
      ];
    } else if (publicSelected && !myAgentsSelected) {
      where = [
        {
          space: {
            id: In(spacesFilter),
          },
          latestPublishVersion: Not(IsNull()),
        },
        {
          space: {
            id: IsNull(),
          },
          latestPublishVersion: Not(IsNull()),
        },
      ];
    } else if (!publicSelected && myAgentsSelected) {
      if (spacesFilter && spacesFilter.length > 0) {
        where = [
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
            id: In(coAuthorAgentsIds),
          },
        ];
      } else {
        where = [
          {
            createdBy: {
              id: currentUser.id,
            },
          },
          {
            id: In(coAuthorAgentsIds),
          },
        ];
      }
    } else if (spacesFilter && spacesFilter.length > 0) {
      where = [
        {
          space: {
            id: In(spacesFilter),
          },
          latestPublishVersion: Not(IsNull()),
        },
      ];
    } else {
      if (!userSpacesIds) {
        throw new BlUnauthorizedException('User has no space');
      }
      where = [
        {
          latestPublishVersion: Not(IsNull()),
          space: {
            id: IsNull(),
          },
        },
        {
          latestPublishVersion: Not(IsNull()),
          space: {
            id: In(userSpacesIds),
          },
        },
      ];
    }

    if (titleFilter && titleFilter.length > 0) {
      where = where.map((w) => {
        w.title = Like(`%${titleFilter}%`);
        return w;
      });
    }

    if (personalOnly) {
      where = where.map((w) => {
        w.createdBy = {
          id: currentUser.id,
        };
        return w;
      });
    }
    return where;
  }

  public async findAllWithFilters(
    spacesFilter: string[],
    titleFilter: string,
    publicSelected: boolean,
    myAgentsSelected: boolean,
    personalOnly: boolean,
    user: HnUser = null,
    userSpacesIds: string[] = null,
    coAuthorAgentsIds: string[] = null
  ): Promise<HnAgent[]> {
    const where = this.buildFindWhereWithFilters(
      spacesFilter,
      titleFilter,
      publicSelected,
      myAgentsSelected,
      personalOnly,
      user,
      userSpacesIds,
      coAuthorAgentsIds
    );

    return this.agentRepository.find({
      where: where,
      order: { createdAt: 'DESC' as any },
    });
  }

  public async findAllWithFiltersPaginated(
    spacesFilter: string[],
    titleFilter: string,
    publicSelected: boolean,
    myAgentsSelected: boolean,
    personalOnly: boolean,
    page: number,
    size: number,
    sortsCriteria: BlSearchSortCriteria[] = [{ key: 'createdAt', direction: 'DESC' }],
    user: HnUser = null,
    userSpacesIds: string[] = null,
    coAuthorAgentsIds: string[] = null
  ): Promise<ClPage<HnAgentDto>> {
    const where = this.buildFindWhereWithFilters(
      spacesFilter,
      titleFilter,
      publicSelected,
      myAgentsSelected,
      personalOnly,
      user,
      userSpacesIds,
      coAuthorAgentsIds
    );

    const order: any = {};
    for (const sortCriteria of sortsCriteria) {
      order[sortCriteria.key] = sortCriteria.direction;
    }

    return (
      await BlAbstractPaginatedService.findPaginatedStatic(
        page,
        size,
        {
          where: where,
          order: order,
        },
        this.agentRepository.manager,
        HnAgent
      )
    ).map((agent) => new HnAgentDto(agent));
  }

  public async findUserAgents(
    user: HnUser,
    commonSpacesIds: string[],
    page: number,
    size: number
  ): Promise<ClPage<HnAgentDto>> {
    const whereOpts: FindOptionsWhere<HnAgent>[] = [];

    const coAuthorAgentsIds = (await this.agentCoAuthorService.getAgentCoAuthorsByUserId(user.id)).map(
      (coAuthor) => coAuthor.agent.id
    );

    // TODO: Add coauthor gestion
    if (commonSpacesIds?.length > 0) {
      whereOpts.push({
        space: {
          id: In(commonSpacesIds),
        },
        createdBy: {
          id: user.id,
        },
      });

      whereOpts.push({
        space: {
          id: In(commonSpacesIds),
        },
        id: In(coAuthorAgentsIds),
      });
    }

    whereOpts.push({
      space: IsNull(),
      createdBy: {
        id: user.id,
      },
    });

    whereOpts.push({
      space: IsNull(),
      id: In(coAuthorAgentsIds),
    });

    whereOpts.map((w) => {
      w.latestPublishVersion = Not(IsNull());
      return w;
    });

    return (
      await BlAbstractPaginatedService.findPaginatedStatic(
        page,
        size,
        {
          where: whereOpts,
          order: { createdAt: 'DESC' as any },
        },
        this.agentRepository.manager,
        HnAgent
      )
    ).map((agent) => new HnAgentDto(agent));
  }

  public async findPublicAgentById(id: string): Promise<HnAgent> {
    return this.agentRepository.findOneBy({
      id: id,
      space: IsNull(),
      latestPublishVersion: Not(IsNull()),
    });
  }

  public async create(
    agentDto: HnCreateAgentDto,
    entityManager: EntityManager,
    parentAgentVersionId?: string,
    user?: HnUser
  ): Promise<HnAgent> {
    const agent = HnAgent.init(agentDto, parentAgentVersionId, user);
    return entityManager.save(agent);
  }

  public async updateTitle(id: string, title: string): Promise<HnAgent> {
    const agent = await this.checkIfCreatorOrCoAuthorAndGetAgent(id);
    agent.title = title;
    return this.agentRepository.save(agent);
  }

  public async updateDescription(id: string, description: TeRichText): Promise<HnAgent> {
    const agent = await this.checkIfCreatorOrCoAuthorAndGetAgent(id);
    agent.setDescriptionRichText(description);
    return this.agentRepository.save(agent);
  }

  public async updateAgentLatestPublishVersion(
    id: string,
    latestPublishVersion: HnAgentVersion,
    entityManager: EntityManager
  ): Promise<HnAgent> {
    const agent = await this.checkIfCreatorOrCoAuthorAndGetAgent(id);
    agent.latestPublishVersion = latestPublishVersion.version;
    agent.latestStyle = latestPublishVersion.style;
    return entityManager.save(agent);
  }

  public async updateLatestStyleWithEntityManager(
    agent: HnAgent,
    style: HnTypingStyle,
    entityManager: EntityManager
  ): Promise<HnAgent> {
    agent.latestStyle = style;
    return entityManager.save(agent);
  }

  public async checkIfCreatorOrCoAuthorAndGetAgent(agentId: string): Promise<HnAgent> {
    const agent = await this.agentRepository.findOneBy({ id: agentId });
    if (!agent || agent.createdBy.id != HnCurrentUserHelper.getAndCheckCurrentUser().id) {
      const coAuthors = await this.agentCoAuthorService.getAgentCoAuthorsByAgentId(agentId);
      if (
        !coAuthors.some((coAuthor) => coAuthor.user.id === HnCurrentUserHelper.getAndCheckCurrentUser().id)
      ) {
        throw new BlUnauthorizedException(
          `User ${
            HnCurrentUserHelper.getAndCheckCurrentUser().id
          } is not the creator or co-author of agent ${agent.id}`
        );
      }
    }
    return agent;
  }

  public async checkIfCreatorAndGetAgent(agentId: string): Promise<HnAgent> {
    const agent = await this.agentRepository.findOneBy({ id: agentId });
    if (!agent || agent.createdBy.id != HnCurrentUserHelper.getAndCheckCurrentUser().id) {
      throw new BlUnauthorizedException(
        `User ${HnCurrentUserHelper.getAndCheckCurrentUser().id} is not the creator of agent ${agent.id}`
      );
    }

    return agent;
  }

  public async delete(entityManager: EntityManager, id: string): Promise<void> {
    await entityManager.delete(HnAgent, { id: id });
  }

  public async updateLatestStyle(agentId: string, style: HnTypingStyle): Promise<HnAgent> {
    const agent = await this.checkIfCreatorOrCoAuthorAndGetAgent(agentId);
    agent.latestStyle = style;
    return this.agentRepository.save(agent);
  }

  public async updateComments(agentId: string, numberOfComments: number): Promise<void> {
    const agent = await this.findOne(agentId);
    agent.comments = numberOfComments;
    await this.agentRepository.save(agent);
  }

  public async updateLikes(agentId: string, numberOfLikes: number): Promise<void> {
    const agent = await this.findOne(agentId);
    agent.likes = numberOfLikes;
    await this.agentRepository.save(agent, { listeners: false });
  }
}
