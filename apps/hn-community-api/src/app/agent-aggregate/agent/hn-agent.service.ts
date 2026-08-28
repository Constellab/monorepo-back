import {
  BlAbstractPaginatedService,
  BlNotFoundException,
  BlSearchSortCriteria,
  BlUnauthorizedException,
} from '@monorepo/back-core-lib';
import { ClPage, ClStringHelper } from '@monorepo/core-lib';
import { TeRichText } from '@monorepo/te-text-editor';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, In, IsNull, Like, Not, Repository } from 'typeorm';

import { HnTypingStyle } from '../../brick-aggregate/brick/hn-brick.dto';
import { HnCurrentUserHelper } from '../../core/utils/hn-current-user.helper';
import { HnSpaceDto } from '../../space-aggregate/space/hn-space.dto';
import { HnSpace } from '../../space-aggregate/space/hn-space.entity';
import { HnUser } from '../../users/hn-user.entity';
import { HnAgentCoAuthorService } from '../agent-co-author/hn-agent-co-author.service';
import { HnAgentVersion } from '../agent-version/hn-agent-version.entity';
import { HnAgentDto, HnCreateAgentDto } from './hn-agent.dto';
import { HnAgent } from './hn-agent.entity';

export interface HnAgentWhereFilters {
  spacesFilter: string[];
  titleFilter: string;
  publicSelected: boolean;
  myAgentsSelected: boolean;
  personalOnly: boolean;
  user?: HnUser | null;
  userSpacesIds?: string[] | null;
  coAuthorAgentsIds?: string[] | null;
}

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

  public async findOne(id: string): Promise<HnAgent | null> {
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

  public async findAgentByIdWithUserSpaces(id: string, userSpacesId: string[]): Promise<HnAgent | null> {
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

  public buildFindWhereWithFilters(filters: HnAgentWhereFilters): FindOptionsWhere<HnAgent>[] {
    const currentUser = filters.user ? filters.user : HnCurrentUserHelper.getCurrentUser();

    let where: FindOptionsWhere<HnAgent>[] = this.buildWhereForSelection(filters, currentUser);

    if (filters.titleFilter && filters.titleFilter.length > 0) {
      where = where.map((w) => {
        w.title = Like(`%${ClStringHelper.escapeSqlLike(filters.titleFilter)}%`);
        return w;
      });
    }

    if (filters.personalOnly) {
      if (currentUser == null) {
        throw new BlUnauthorizedException('User has no space');
      }
      where = where.map((w) => {
        w.createdBy = {
          id: currentUser.id,
        };
        return w;
      });
    }
    return where;
  }

  /**
   * Build the where clause matching the selected spaces, before the title and personal filters
   */
  private buildWhereForSelection(
    filters: HnAgentWhereFilters,
    currentUser: HnUser | null
  ): FindOptionsWhere<HnAgent>[] {
    if (currentUser == null) {
      return [
        {
          space: {
            id: IsNull(),
          },
          latestPublishVersion: Not(IsNull()),
        },
      ];
    }

    if (filters.publicSelected && filters.myAgentsSelected) {
      return this.buildPublicAndMyAgentsWhere(filters, currentUser);
    }

    if (filters.publicSelected) {
      return [
        {
          space: {
            id: In(filters.spacesFilter),
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
    }

    if (filters.myAgentsSelected) {
      return this.buildMyAgentsWhere(filters, currentUser);
    }

    if (filters.spacesFilter && filters.spacesFilter.length > 0) {
      return [
        {
          space: {
            id: In(filters.spacesFilter),
          },
          latestPublishVersion: Not(IsNull()),
        },
      ];
    }

    return this.buildUserSpacesWhere(filters.userSpacesIds);
  }

  private buildPublicAndMyAgentsWhere(
    filters: HnAgentWhereFilters,
    currentUser: HnUser
  ): FindOptionsWhere<HnAgent>[] {
    return [
      {
        space: {
          id: In(filters.spacesFilter),
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
          id: In(filters.spacesFilter),
        },
        id: In(filters.coAuthorAgentsIds ?? []),
      },
      {
        space: {
          id: IsNull(),
        },
        id: In(filters.coAuthorAgentsIds ?? []),
      },
    ];
  }

  private buildMyAgentsWhere(filters: HnAgentWhereFilters, currentUser: HnUser): FindOptionsWhere<HnAgent>[] {
    if (filters.spacesFilter && filters.spacesFilter.length > 0) {
      return [
        {
          space: {
            id: In(filters.spacesFilter),
          },
          createdBy: {
            id: currentUser.id,
          },
        },
        {
          space: {
            id: In(filters.spacesFilter),
          },
          id: In(filters.coAuthorAgentsIds ?? []),
        },
      ];
    }

    return [
      {
        createdBy: {
          id: currentUser.id,
        },
      },
      {
        id: In(filters.coAuthorAgentsIds ?? []),
      },
    ];
  }

  private buildUserSpacesWhere(userSpacesIds: string[] | null | undefined): FindOptionsWhere<HnAgent>[] {
    if (!userSpacesIds) {
      throw new BlUnauthorizedException('User has no space');
    }
    return [
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

  public async findAllWithFilters(filters: HnAgentWhereFilters): Promise<HnAgent[]> {
    const where = this.buildFindWhereWithFilters(filters);

    return this.agentRepository.find({
      where: where,
      order: { createdAt: 'DESC' },
    });
  }

  public async findAllWithFiltersPaginated(
    filters: HnAgentWhereFilters,
    page: number,
    size: number,
    sortsCriteria: BlSearchSortCriteria[] = [{ key: 'createdAt', direction: 'DESC' }]
  ): Promise<ClPage<HnAgentDto>> {
    const where = this.buildFindWhereWithFilters(filters);

    const order: any = sortsCriteria?.length > 0 ? {} : { createdAt: 'DESC' };
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
        id: In(coAuthorAgentsIds ?? []),
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
      id: In(coAuthorAgentsIds ?? []),
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

  public async findPublicAgentById(id: string): Promise<HnAgent | null> {
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

  public async updateTitle(agent: HnAgent, title: string): Promise<HnAgent> {
    agent.title = title;
    return this.agentRepository.save(agent);
  }

  public async updateDescription(agent: HnAgent, description: TeRichText): Promise<HnAgent> {
    agent.setDescriptionRichText(description);
    return this.agentRepository.save(agent);
  }

  public async updateSpace(agent: HnAgent, space: HnSpace | null): Promise<HnAgent> {
    agent.space = space ?? null;
    return this.agentRepository.save(agent);
  }

  public async updateAgentLatestPublishVersion(
    agent: HnAgent,
    latestPublishVersion: HnAgentVersion,
    entityManager: EntityManager
  ): Promise<HnAgent> {
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

  public async delete(entityManager: EntityManager, id: string): Promise<void> {
    await entityManager.delete(HnAgent, { id: id });
  }

  public async updateLatestStyle(agentId: string, style: HnTypingStyle | undefined): Promise<HnAgent> {
    const agent = await this.agentRepository.findOneBy({ id: agentId });
    if (agent == null) {
      throw new BlNotFoundException('Agent not found');
    }
    agent.latestStyle = style ?? null;
    return this.agentRepository.save(agent);
  }

  public async updateComments(agentId: string, numberOfComments: number): Promise<void> {
    const agent = await this.findOne(agentId);
    if (agent == null) {
      throw new BlNotFoundException('Agent not found');
    }
    agent.comments = numberOfComments;
    await this.agentRepository.save(agent);
  }

  public async updateLikes(agentId: string, numberOfLikes: number): Promise<void> {
    const agent = await this.findOne(agentId);
    if (agent == null) {
      throw new BlNotFoundException('Agent not found');
    }
    agent.likes = numberOfLikes;
    await this.agentRepository.save(agent, { listeners: false });
  }
}
