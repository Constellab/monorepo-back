import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HnTagValue } from './hn-tag-value.entity';
import { EntityManager, Repository } from 'typeorm';
import { HnTagKey } from '../tag-key/hn-tag-key.entity';
import { HnEditTagValueDto } from './hn-tag-value.dto';
import { ClPage } from '@monorepo/core-lib';
import { BlAbstractPaginatedService } from '@monorepo/back-core-lib';

@Injectable()
export class HnTagValueService {
  constructor(
    @InjectRepository(HnTagValue)
    private tagValueRepository: Repository<HnTagValue>
  ) {}

  /**
   * Create a tag value
   * @param tagKey
   * @param createTagValueDto
   * @param entityManager
   */
  async createTagValue(
    tagKey: HnTagKey,
    createTagValueDto: HnEditTagValueDto,
    entityManager?: EntityManager
  ): Promise<HnTagValue> {
    const tagValue = new HnTagValue();
    tagValue.value = createTagValueDto.value;
    tagValue.shortDescription = createTagValueDto.shortDescription;
    tagValue.additionalInfos = createTagValueDto.additionalInfos;
    tagValue.deprecated = false;
    tagValue.tagKey = tagKey;
    if (entityManager) {
      return entityManager.save(tagValue);
    }
    return this.tagValueRepository.save(tagValue);
  }

  /**
   * Get tag value by id
   * @param tagKey
   * @param updateTagValueDto
   */
  async updateTagValue(tagKey: HnTagKey, updateTagValueDto: HnEditTagValueDto): Promise<HnTagValue> {
    const tagValue = await this.tagValueRepository.findOneBy({ id: updateTagValueDto.id });
    if (!tagValue || tagValue.tagKey.id !== tagKey.id || tagValue.value !== updateTagValueDto.value) {
      throw new Error('Tag value not found');
    }
    tagValue.shortDescription = updateTagValueDto.shortDescription;
    tagValue.additionalInfos = updateTagValueDto.additionalInfos;
    return this.tagValueRepository.save(tagValue);
  }

  async updateTagValueWithEntityManager(
    tagValue: HnTagValue,
    entityManager: EntityManager
  ): Promise<HnTagValue> {
    return entityManager.save(tagValue, { listeners: false });
  }

  /**
   * Get tag value by id
   * @param id
   */
  async getTagValueById(id: string): Promise<HnTagValue> {
    return this.tagValueRepository.findOneBy({ id: id });
  }

  async checkTagValueExists(tagKeyId: string, value: string): Promise<boolean> {
    const tagValue = await this.tagValueRepository.findOneBy({ tagKey: { id: tagKeyId }, value: value });
    return !!tagValue;
  }

  /**
   * Get tag values list by tag key technical name
   * @param tagKeyId
   */
  async getAllTagValuesByTagKeyId(tagKeyId: string): Promise<HnTagValue[]> {
    return this.tagValueRepository.find({
      where: { tagKey: { id: tagKeyId } },
      order: { deprecated: 'ASC' },
    });
  }

  /**
   * Get tag values list by tag key id
   * @param tagKeyId
   * @param page
   * @param size
   */
  async getTagValuesByTagKeyId(tagKeyId: string, page: number, size: number): Promise<ClPage<HnTagValue>> {
    return BlAbstractPaginatedService.findPaginatedStatic(
      page,
      size,
      {
        where: { tagKey: { id: tagKeyId } },
        order: { deprecated: 'ASC' },
      },
      this.tagValueRepository.manager,
      HnTagValue
    );
  }

  async deleteTagValue(tagValueID: string): Promise<HnTagValue> {
    const tagValue = await this.tagValueRepository.findOneBy({ id: tagValueID });
    if (!tagValue) {
      throw new Error('Tag value not found');
    }
    return this.tagValueRepository.remove(tagValue);
  }

  async deprecatedTagValue(tagKeyId: string, tagValueId: string): Promise<HnTagValue> {
    const tagValue = await this.tagValueRepository.findOneBy({ id: tagValueId });
    if (!tagValue || tagValue.tagKey.id !== tagKeyId) {
      throw new Error('Tag value not found');
    }
    tagValue.deprecated = true;
    return this.tagValueRepository.save(tagValue);
  }

  async checkTagHasValues(tagKeyId: string): Promise<boolean> {
    return this.tagValueRepository.exists({ where: { tagKey: { id: tagKeyId } } });
  }

  async saveTagValueWithEntityManager(
    tagValue: HnTagValue,
    entityManager: EntityManager
  ): Promise<HnTagValue> {
    return entityManager.save(tagValue);
  }

  async setAdditionalInfoToNull(
    tagKeyId: string,
    additionalInfoName: string,
    entityManager: EntityManager
  ): Promise<void> {
    const tagValues = await this.tagValueRepository.findBy({ tagKey: { id: tagKeyId } });
    for (const tagValue of tagValues) {
      if (tagValue.tagKey.id !== tagKeyId) {
        throw new Error('Tag value not found');
      }
      if (!tagValue.additionalInfos) {
        tagValue.additionalInfos = {};
      }
      tagValue.additionalInfos[additionalInfoName] = null;
      await entityManager.save(tagValue);
    }
  }
}
