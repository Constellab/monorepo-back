import {
  BlAbstractPaginatedService,
  BlBadRequestException,
  BlNotFoundException,
  BlSearchSortCriteria,
  BlUnauthorizedException,
} from '@monorepo/back-core-lib';
import { ClDateHelper, ClPage, ClStringHelper } from '@monorepo/core-lib';
import { TeRichTextDTO } from '@monorepo/te-text-editor';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, In, IsNull, Like, Not, Repository } from 'typeorm';

import { HnCurrentUserHelper } from '../../core/utils/hn-current-user.helper';
import { HnSpace } from '../../space-aggregate/space/hn-space.entity';
import { HnUser } from '../../users/hn-user.entity';
import { HnCreateTagKeyDto } from './hn-tag-key.dto';
import { HnTagKey, HnTagKeyAdditionalInfosSpecs } from './hn-tag-key.entity';

/**
 * Filters used to restrict a tag key search
 */
export interface HnFindTagKeysFilters {
  spacesFilter: string[];
  technicalNameFilter: string;
  labelFilter: string;
  publicSelected: boolean;
  myTagKeysSelected: boolean;
  personalOnly: boolean;
  user?: HnUser | null;
  userSpacesIds?: string[] | null;
  coAuthorTagKeysIds?: string[] | null;
}

@Injectable()
export class HnTagKeyService {
  constructor(
    @InjectRepository(HnTagKey)
    private tagKeyRepository: Repository<HnTagKey>
  ) {}

  /**
   * Find all published tag keys
   */
  async findAllPublishedTagKeys(): Promise<HnTagKey[]> {
    return this.tagKeyRepository.find({
      where: {
        publishedAt: Not(IsNull()),
      },
    });
  }

  /**
   * Simple get tag key by id method
   * @param id
   */
  async getTagKeyById(id: string): Promise<HnTagKey | null> {
    return this.tagKeyRepository.findOneBy({ id: id });
  }

  /**
   * Get tag key by id method if user is not connected
   * @param id
   */
  async getPublicTagKeyById(id: string): Promise<HnTagKey | null> {
    return this.tagKeyRepository.findOneBy({
      id: id,
      space: IsNull(),
      publishedAt: Not(IsNull()),
    });
  }

  /**
   * Get tag key by id with user is connected
   * @param id
   * @param userSpacesIds
   */
  async getTagKeyByIdWithUserSpacesIds(id: string, userSpacesIds: string[]): Promise<HnTagKey | null> {
    return this.tagKeyRepository.findOne({
      where: [
        {
          id: id,
          space: {
            id: In(userSpacesIds),
          },
        },
        {
          id: id,
          space: IsNull(),
        },
      ],
    });
  }

  async getTagKeyByTechnicalName(technicalName: string, userSpacesIds: string[]): Promise<HnTagKey | null> {
    return this.tagKeyRepository.findOne({
      where: [
        {
          technicalName: technicalName,
          space: {
            id: In(userSpacesIds),
          },
        },
        {
          technicalName: technicalName,
          space: IsNull(),
        },
      ],
    });
  }

  async updateLikes(tagKeyLike: string, numberOfLikes: number): Promise<void> {
    const tagKey = await this.getTagKeyById(tagKeyLike);
    if (!tagKey) {
      throw new BlNotFoundException('Tag not found');
    }
    tagKey.likes = numberOfLikes;
    await this.tagKeyRepository.save(tagKey, { listeners: false });
  }

  async updateComments(tagKeyId: string, numberOfComments: number): Promise<void> {
    const tagKey = await this.getTagKeyById(tagKeyId);
    if (!tagKey) {
      throw new BlNotFoundException('Tag not found');
    }
    tagKey.comments = numberOfComments;
    await this.tagKeyRepository.save(tagKey);
  }

  /**
   * Get paginated tag keys with filters
   * @param filters
   * @param sortsCriteria
   * @param page
   * @param size
   */
  public async findAllTagKeysWithFiltersPaginated(
    filters: HnFindTagKeysFilters,
    sortsCriteria: BlSearchSortCriteria[],
    page: number,
    size: number
  ): Promise<ClPage<HnTagKey>> {
    const where = this.buildFindWhereWithFilters(filters);

    const order: any =
      sortsCriteria?.length > 0 ? { deprecated: 'ASC' } : { deprecated: 'ASC', createdAt: 'DESC' };
    for (const sortCriteria of sortsCriteria) {
      if (sortCriteria.key === 'title') {
        order['label'] = sortCriteria.direction;
      } else {
        order[sortCriteria.key] = sortCriteria.direction;
      }
    }

    return BlAbstractPaginatedService.findPaginatedStatic(
      page,
      size,
      {
        where: where,
        order: order,
      },
      this.tagKeyRepository.manager,
      HnTagKey
    );
  }

  /**
   * Create tag key
   * @param createTagKeyDto
   * @param space
   * @param entityManager
   */
  public async createTagKey(
    createTagKeyDto: HnCreateTagKeyDto,
    space?: HnSpace,
    entityManager?: EntityManager
  ): Promise<HnTagKey> {
    const tagKey: HnTagKey = new HnTagKey();
    tagKey.technicalName = createTagKeyDto.technicalName;
    tagKey.label = createTagKeyDto.label;
    tagKey.type = createTagKeyDto.type;
    tagKey.unit = createTagKeyDto.unit ?? null;
    tagKey.space = space ?? null;
    tagKey.tagValues = [];
    if (entityManager) {
      return entityManager.save(tagKey);
    }
    return this.tagKeyRepository.save(tagKey);
  }

  /**
   * Update tag key
   * @param tagKey
   * @param updateTagKeyDto
   * @param space
   */
  public async updateTagKey(
    tagKey: HnTagKey,
    updateTagKeyDto: HnCreateTagKeyDto,
    space?: HnSpace
  ): Promise<HnTagKey> {
    if (tagKey.technicalName != updateTagKeyDto.technicalName || tagKey.id != updateTagKeyDto.id) {
      throw new BlBadRequestException('Error updating tag key technical name or id');
    }
    tagKey.label = updateTagKeyDto.label;
    tagKey.type = updateTagKeyDto.type;
    tagKey.unit = updateTagKeyDto.unit ?? null;
    tagKey.space = space ?? null;
    return this.tagKeyRepository.save(tagKey);
  }

  /**
   * Check if tag key exists
   * @param technicalName
   */
  public async checkTagKeyExists(technicalName: string): Promise<boolean> {
    const tagKey = await this.tagKeyRepository.findOneBy({
      technicalName: technicalName,
    });
    return !!tagKey;
  }

  /**
   * Update tag key description
   * @param tagKey
   * @param description
   */
  public async updateDescription(tagKey: HnTagKey, description: TeRichTextDTO): Promise<HnTagKey> {
    tagKey.description = description;
    return this.tagKeyRepository.save(tagKey);
  }

  /**
   * Update tag key additional infos specs
   * @param tagKey
   * @param additionalInfosSpecs
   * @param entityManager
   */
  public async updateAdditionalInfosSpecs(
    tagKey: HnTagKey,
    additionalInfosSpecs: HnTagKeyAdditionalInfosSpecs,
    entityManager: EntityManager | null = null
  ): Promise<HnTagKeyAdditionalInfosSpecs> {
    tagKey.additionalInfosSpecs = additionalInfosSpecs;
    let savedTagKey: HnTagKey;
    if (entityManager) {
      savedTagKey = await entityManager.save(tagKey);
    } else {
      savedTagKey = await this.tagKeyRepository.save(tagKey);
    }
    return savedTagKey.additionalInfosSpecs ?? additionalInfosSpecs;
  }

  /**
   * Publish tag key
   * @param tagKey
   */
  public async publishTagKey(tagKey: HnTagKey): Promise<HnTagKey> {
    tagKey.publishedAt = ClDateHelper.getDate();
    return this.tagKeyRepository.save(tagKey);
  }

  /**
   * Delete tag key
   * @param tagKey
   */
  public async deleteTagKey(tagKey: HnTagKey): Promise<HnTagKey> {
    return this.tagKeyRepository.remove(tagKey);
  }

  /**
   * Deprecate tag key
   * @param tagKey
   * @param entityManager
   */
  public async deprecateTagKey(tagKey: HnTagKey, entityManager: EntityManager): Promise<HnTagKey> {
    tagKey.deprecated = true;
    return entityManager.save(tagKey);
  }

  /**
   * Save tag key
   * @param tagKey
   * @param entityManager
   */
  public async saveTagKeyWithEntityManager(
    tagKey: HnTagKey,
    entityManager: EntityManager
  ): Promise<HnTagKey> {
    return entityManager.save(tagKey);
  }

  /**
   * Build the where clause with filters to get tag keys
   * @param filters
   * @private
   */
  private buildFindWhereWithFilters(filters: HnFindTagKeysFilters): FindOptionsWhere<HnTagKey>[] {
    const currentUser = filters.user ? filters.user : HnCurrentUserHelper.getCurrentUser();

    let where = currentUser == null ? this.buildAnonymousWhere() : this.buildUserWhere(filters, currentUser);
    where = this.applyNameFilters(where, filters);
    return this.applyPersonalOnlyFilter(where, filters.personalOnly, currentUser);
  }

  /**
   * Where clause for a visitor that is not logged in: only published public tag keys
   * @private
   */
  private buildAnonymousWhere(): FindOptionsWhere<HnTagKey>[] {
    return [
      {
        space: {
          id: IsNull(),
        },
        publishedAt: Not(IsNull()),
      },
    ];
  }

  /**
   * Where clause selecting the tag keys the given user asked for, depending on the selected scopes
   * @private
   */
  private buildUserWhere(filters: HnFindTagKeysFilters, currentUser: HnUser): FindOptionsWhere<HnTagKey>[] {
    const { spacesFilter, publicSelected, myTagKeysSelected } = filters;

    if (publicSelected && myTagKeysSelected) {
      return this.buildMyTagKeysWithPublicWhere(filters, currentUser);
    }
    if (publicSelected && !myTagKeysSelected) {
      return [
        {
          space: {
            id: In(spacesFilter),
          },
          publishedAt: Not(IsNull()),
        },
        {
          space: {
            id: IsNull(),
          },
          publishedAt: Not(IsNull()),
        },
      ];
    }
    if (!publicSelected && myTagKeysSelected) {
      return this.buildMyTagKeysWhere(filters, currentUser);
    }
    if (spacesFilter && spacesFilter.length > 0) {
      return [
        {
          space: {
            id: In(spacesFilter),
          },
          publishedAt: Not(IsNull()),
        },
      ];
    }
    return this.buildUserSpacesWhere(filters.userSpacesIds);
  }

  /**
   * Where clause for the tag keys owned or co-authored by the user, public space included
   * @private
   */
  private buildMyTagKeysWithPublicWhere(
    filters: HnFindTagKeysFilters,
    currentUser: HnUser
  ): FindOptionsWhere<HnTagKey>[] {
    const { spacesFilter, coAuthorTagKeysIds } = filters;
    return [
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
        id: In(coAuthorTagKeysIds ?? []),
      },
      {
        space: {
          id: IsNull(),
        },
        id: In(coAuthorTagKeysIds ?? []),
      },
    ];
  }

  /**
   * Where clause for the tag keys owned or co-authored by the user, restricted to the filtered spaces
   * @private
   */
  private buildMyTagKeysWhere(
    filters: HnFindTagKeysFilters,
    currentUser: HnUser
  ): FindOptionsWhere<HnTagKey>[] {
    const { spacesFilter, coAuthorTagKeysIds } = filters;

    if (spacesFilter && spacesFilter.length > 0) {
      return [
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
          id: In(coAuthorTagKeysIds ?? []),
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
        id: In(coAuthorTagKeysIds ?? []),
      },
    ];
  }

  /**
   * Where clause for the published tag keys visible in the user spaces
   * @private
   */
  private buildUserSpacesWhere(userSpacesIds: string[] | null | undefined): FindOptionsWhere<HnTagKey>[] {
    if (!userSpacesIds) {
      throw new BlUnauthorizedException('User has no space');
    }
    return [
      {
        publishedAt: Not(IsNull()),
        space: {
          id: IsNull(),
        },
      },
      {
        publishedAt: Not(IsNull()),
        space: {
          id: In(userSpacesIds),
        },
      },
    ];
  }

  /**
   * Restrict the where clause to the technical name and label filters
   * @private
   */
  private applyNameFilters(
    where: FindOptionsWhere<HnTagKey>[],
    filters: HnFindTagKeysFilters
  ): FindOptionsWhere<HnTagKey>[] {
    const { technicalNameFilter, labelFilter } = filters;
    let result = where;

    if (technicalNameFilter && technicalNameFilter.length > 0) {
      result = result.map((w) => {
        w.technicalName = Like(`%${ClStringHelper.escapeSqlLike(technicalNameFilter)}%`);
        return w;
      });
    }

    if (labelFilter && labelFilter.length > 0) {
      result = result.map((w) => {
        w.label = Like(`%${ClStringHelper.escapeSqlLike(labelFilter)}%`);
        return w;
      });
    }
    return result;
  }

  /**
   * Restrict the where clause to the tag keys created by the current user
   * @private
   */
  private applyPersonalOnlyFilter(
    where: FindOptionsWhere<HnTagKey>[],
    personalOnly: boolean,
    currentUser: HnUser | null
  ): FindOptionsWhere<HnTagKey>[] {
    if (!personalOnly) {
      return where;
    }
    if (currentUser == null) {
      throw new BlUnauthorizedException('User has no space');
    }
    return where.map((w) => {
      w.createdBy = {
        id: currentUser.id,
      };
      return w;
    });
  }
}
