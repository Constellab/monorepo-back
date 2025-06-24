import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HnTagKey, HnTagKeyAdditionalInfosSpecs } from './hn-tag-key.entity';
import { EntityManager, FindOptionsWhere, In, IsNull, Like, Not, Repository } from 'typeorm';
import { ClDateHelper, ClPage } from '@monorepo/core-lib';
import { HnUser } from '../../users/hn-user.entity';
import { HnCurrentUserHelper } from '../../core/utils/hn-current-user.helper';
import { BlAbstractPaginatedService, BlUnauthorizedException } from '@monorepo/back-core-lib';
import { HnCreateTagKeyDto } from './hn-tag-key.dto';
import { HnSpace } from '../../space-aggregate/space/hn-space.entity';
import { TeRichTextDTO } from '@monorepo/te-text-editor';

@Injectable()
export class HnTagKeyService {
  constructor(
    @InjectRepository(HnTagKey)
    private tagKeyRepository: Repository<HnTagKey>
  ) {}

  /**
   * Simple get tag key by id method
   * @param id
   */
  async getTagKeyById(id: string): Promise<HnTagKey> {
    return this.tagKeyRepository.findOneBy({ id: id });
  }

  /**
   * Get tag key by id method if user is not connected
   * @param id
   */
  async getPublicTagKeyById(id: string): Promise<HnTagKey> {
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
  async getTagKeyByIdWithUserSpacesIds(id: string, userSpacesIds: string[]): Promise<HnTagKey> {
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

  async getTagKeyByTechnicalName(technicalName: string, userSpacesIds: string[]): Promise<HnTagKey> {
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
      throw new Error('Tag not found');
    }
    tagKey.likes = numberOfLikes;
    await this.tagKeyRepository.save(tagKey, { listeners: false });
  }

  async updateComments(tagKeyId: string, numberOfComments: number): Promise<void> {
    const tagKey = await this.getTagKeyById(tagKeyId);
    if (!tagKey) {
      throw new Error('Tag not found');
    }
    tagKey.comments = numberOfComments;
    await this.tagKeyRepository.save(tagKey);
  }

  /**
   * Get paginated tag keys with filters
   * @param spacesFilter
   * @param technicalNameFilter
   * @param labelFilter
   * @param publicSelected
   * @param myTagKeysSelected
   * @param personalOnly
   * @param page
   * @param size
   * @param user
   * @param userSpacesIds
   * @param coAuthorTagKeysIds
   */
  public async findAllTagKeysWithFiltersPaginated(
    spacesFilter: string[],
    technicalNameFilter: string,
    labelFilter: string,
    publicSelected: boolean,
    myTagKeysSelected: boolean,
    personalOnly: boolean,
    page: number,
    size: number,
    user: HnUser = null,
    userSpacesIds: string[] = null,
    coAuthorTagKeysIds: string[] = null
  ): Promise<ClPage<HnTagKey>> {
    const where = this.buildFindWhereWithFilters(
      spacesFilter,
      technicalNameFilter,
      labelFilter,
      publicSelected,
      myTagKeysSelected,
      personalOnly,
      user,
      userSpacesIds,
      coAuthorTagKeysIds
    );

    return BlAbstractPaginatedService.findPaginatedStatic(
      page,
      size,
      {
        where: where,
        order: { deprecated: 'ASC' as any, createdAt: 'DESC' as any },
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
    tagKey.unit = createTagKeyDto.unit;
    tagKey.space = space;
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
      throw new Error('Error updating tag key technical name or id');
    }
    tagKey.label = updateTagKeyDto.label;
    tagKey.type = updateTagKeyDto.type;
    tagKey.unit = updateTagKeyDto.unit;
    tagKey.space = space;
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
    entityManager: EntityManager = null
  ): Promise<HnTagKeyAdditionalInfosSpecs> {
    tagKey.additionalInfosSpecs = additionalInfosSpecs;
    let savedTagKey: HnTagKey;
    if (entityManager) {
      savedTagKey = await entityManager.save(tagKey);
    } else {
      savedTagKey = await this.tagKeyRepository.save(tagKey);
    }
    return savedTagKey?.additionalInfosSpecs;
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
   * @param spacesFilter
   * @param technicalNameFilter
   * @param labelFilter
   * @param publicSelected
   * @param myTagKeysSelected
   * @param personalOnly
   * @param user
   * @param userSpacesIds
   * @param coAuthorTagKeysIds
   * @private
   */
  private buildFindWhereWithFilters(
    spacesFilter: string[],
    technicalNameFilter: string,
    labelFilter: string,
    publicSelected: boolean,
    myTagKeysSelected: boolean,
    personalOnly: boolean,
    user: HnUser,
    userSpacesIds: string[],
    coAuthorTagKeysIds: string[]
  ): FindOptionsWhere<HnTagKey>[] {
    let where: FindOptionsWhere<HnTagKey>[];
    const currentUser = user ? user : HnCurrentUserHelper.getCurrentUser();

    if (currentUser == null) {
      where = [
        {
          space: {
            id: IsNull(),
          },
          publishedAt: Not(IsNull()),
        },
      ];
    } else if (publicSelected && myTagKeysSelected) {
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
          id: In(coAuthorTagKeysIds),
        },
        {
          space: {
            id: IsNull(),
          },
          id: In(coAuthorTagKeysIds),
        },
      ];
    } else if (publicSelected && !myTagKeysSelected) {
      where = [
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
    } else if (!publicSelected && myTagKeysSelected) {
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
            id: In(coAuthorTagKeysIds),
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
            id: In(coAuthorTagKeysIds),
          },
        ];
      }
    } else if (spacesFilter && spacesFilter.length > 0) {
      where = [
        {
          space: {
            id: In(spacesFilter),
          },
          publishedAt: Not(IsNull()),
        },
      ];
    } else {
      if (!userSpacesIds) {
        throw new BlUnauthorizedException('User has no space');
      }
      where = [
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

    if (technicalNameFilter && technicalNameFilter.length > 0) {
      where = where.map((w) => {
        w.technicalName = Like(`%${technicalNameFilter}%`);
        return w;
      });
    }

    if (labelFilter && labelFilter.length > 0) {
      where = where.map((w) => {
        w.label = Like(`%${labelFilter}%`);
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
}
