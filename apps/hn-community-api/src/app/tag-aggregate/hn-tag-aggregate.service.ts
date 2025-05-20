import { Injectable } from '@nestjs/common';
import { HnCreateTagKeyDto } from './tag-key/hn-tag-key.dto';
import {
  HnTagKey,
  HnTagKeyAdditionalInfosSpecs,
  HnTagKeyEditAdditionalInfoSpec,
  HnTagKeyType,
} from './tag-key/hn-tag-key.entity';
import { HnUser } from '../users/hn-user.entity';
import { HnCurrentUserHelper } from '../core/utils/hn-current-user.helper';
import { HnSpaceAggregateService } from '../space-aggregate/hn-space-aggregate.service';
import { HnTagCoAuthorService } from './tag-co-author/hn-tag-co-author.service';
import { HnTagKeyService } from './tag-key/hn-tag-key.service';
import { ClPage } from '@monorepo/core-lib';
import { HnSpace } from '../space-aggregate/space/hn-space.entity';
import { TeRichTextDTO } from '@monorepo/te-text-editor';
import { HnEditTagValueDto } from './tag-value/hn-tag-value.dto';
import { HnTagValue } from './tag-value/hn-tag-value.entity';
import { HnTagValueService } from './tag-value/hn-tag-value.service';
import { DataSource } from 'typeorm';

@Injectable()
export class HnTagAggregateService {
  constructor(
    private readonly spaceAggregateService: HnSpaceAggregateService,
    private readonly tagCoAuthorService: HnTagCoAuthorService,
    private readonly tagKeyService: HnTagKeyService,
    private readonly tagValueService: HnTagValueService,
    private dataSource: DataSource
  ) {}

  async getAllTagKeysWithFilters(
    spacesFilter: string[],
    labelFilter: string,
    page: number,
    size: number,
    user: HnUser = null,
    personalOnly: boolean = false
  ): Promise<ClPage<HnTagKey>> {
    const currentUser = user ?? HnCurrentUserHelper.getCurrentUser();
    let publicSelected = false;
    let myTagKeysSelected = false;
    for (const spaceId of spacesFilter) {
      if (spaceId === 'public') publicSelected = true;
      else if (spaceId === 'my-tag-keys') myTagKeysSelected = true;
      else await this.spaceAggregateService.assertCheckSpaceUser(spaceId, currentUser?.id);
    }
    let userSpacesIds: string[] = null;
    let coAuthorTagKeysIds: string[] = [];
    if (currentUser) {
      userSpacesIds = (await this.spaceAggregateService.findSpacesOfUser(currentUser?.id)).map(
        (space) => space.id
      );
      if (myTagKeysSelected) {
        coAuthorTagKeysIds = (await this.tagCoAuthorService.getTagCoAuthorsByUserId(currentUser.id)).map(
          (tagCoAuthor) => tagCoAuthor.tagKey.id
        );
      }
    }

    if (publicSelected) {
      spacesFilter = spacesFilter.filter((spaceId) => spaceId !== 'public');
    }
    if (myTagKeysSelected) {
      spacesFilter = spacesFilter.filter((spaceId) => spaceId !== 'my-tag-keys');
    }

    return await this.tagKeyService.findAllTagKeysWithFiltersPaginated(
      spacesFilter,
      labelFilter,
      publicSelected,
      myTagKeysSelected,
      personalOnly,
      page,
      size,
      user,
      userSpacesIds,
      coAuthorTagKeysIds
    );
  }

  async getTagKeyById(id: string): Promise<HnTagKey> {
    const currentUser = HnCurrentUserHelper.getCurrentUser();
    let tagKey: HnTagKey;
    if (currentUser) {
      const userSpacesIds = (await this.spaceAggregateService.findSpacesOfUser(currentUser?.id)).map(
        (space) => space.id
      );
      tagKey = await this.tagKeyService.getTagKeyByIdWithUserSpacesIds(id, userSpacesIds);
    } else {
      tagKey = await this.tagKeyService.getPublicTagKeyById(id);
    }
    if (!tagKey) {
      throw new Error('Tag key not found');
    }
    return tagKey;
  }

  async createTagKey(createTagKeyDto: HnCreateTagKeyDto): Promise<HnTagKey> {
    if (await this.checkIfTagKeyExists(createTagKeyDto.technicalName)) {
      throw new Error('A tag with this technical name already exist');
    }
    let space: HnSpace = null;
    if (createTagKeyDto.space) {
      space = await this.getSpaceById(createTagKeyDto.space);
    }
    return await this.dataSource.transaction(async (entityManager) => {
      const tagKey = await this.tagKeyService.createTagKey(createTagKeyDto, space, entityManager);
      if (tagKey && tagKey.type === HnTagKeyType.BOOLEAN) {
        await this.tagValueService.createTagValue(
          tagKey,
          {
            value: 'true',
          },
          entityManager
        );
        await this.tagValueService.createTagValue(
          tagKey,
          {
            value: 'false',
          },
          entityManager
        );
      }
      return tagKey;
    });
  }

  async updateTagKey(updateTagKeyDto: HnCreateTagKeyDto): Promise<HnTagKey> {
    let space: HnSpace = null;
    if (updateTagKeyDto.space) {
      space = await this.getSpaceById(updateTagKeyDto.space);
    }
    const tagKey = await this.getSpaceKeyAndCheckRights(updateTagKeyDto.id);
    return await this.tagKeyService.updateTagKey(tagKey, updateTagKeyDto, space);
  }

  async updateTagKeyDescription(tagKeyId: string, description: TeRichTextDTO): Promise<HnTagKey> {
    const tagKey = await this.getSpaceKeyAndCheckRights(tagKeyId);
    return this.tagKeyService.updateDescription(tagKey, description);
  }

  async createAdditionalInfoSpec(
    tagKeyId: string,
    additionalInfoSpec: HnTagKeyEditAdditionalInfoSpec
  ): Promise<HnTagKey> {
    const tagKey = await this.getSpaceKeyAndCheckRights(tagKeyId);
    const additionalInfoSpecs: HnTagKeyAdditionalInfosSpecs = tagKey.additionalInfosSpecs || {};
    if (additionalInfoSpec.name in additionalInfoSpecs) {
      throw new Error(`Additional info spec ${additionalInfoSpec.name} already exists`);
    }
    const hasValues = await this.checkIfTagHasValues(tagKey);
    if (hasValues && !additionalInfoSpec.optional) {
      throw new Error(
        'You cannot create a required additional info spec on a tag key that already has values'
      );
    }
    additionalInfoSpecs[additionalInfoSpec.name] = {
      optional: additionalInfoSpec.optional,
    };
    return this.tagKeyService.updateAdditionalInfosSpecs(tagKey, additionalInfoSpecs);
  }

  async updateAdditionalInfoSpec(
    tagKeyId: string,
    additionalInfoSpec: HnTagKeyEditAdditionalInfoSpec
  ): Promise<HnTagKey> {
    const tagKey = await this.getSpaceKeyAndCheckRights(tagKeyId);
    const additionalInfosSpecs: HnTagKeyAdditionalInfosSpecs = tagKey.additionalInfosSpecs || {};
    if (!(additionalInfoSpec.name in additionalInfosSpecs)) {
      throw new Error(`Additional info spec ${additionalInfoSpec.name} does not exist`);
    }
    additionalInfosSpecs[additionalInfoSpec.name] = {
      optional: additionalInfoSpec.optional,
    };
    return this.tagKeyService.updateAdditionalInfosSpecs(tagKey, additionalInfosSpecs);
  }

  async deleteAdditionalInfoSpec(tagKeyId: string, additionalInfoSpecName: string): Promise<HnTagKey> {
    const tagKey = await this.getSpaceKeyAndCheckRights(tagKeyId);
    const additionalInfosSpecs: HnTagKeyAdditionalInfosSpecs = tagKey.additionalInfosSpecs || {};
    if (!(additionalInfoSpecName in additionalInfosSpecs)) {
      throw new Error(`Additional info spec ${additionalInfoSpecName} does not exist`);
    }
    delete additionalInfosSpecs[additionalInfoSpecName];
    return this.tagKeyService.updateAdditionalInfosSpecs(tagKey, additionalInfosSpecs);
  }

  async publishTagKey(tagKeyId: string): Promise<HnTagKey> {
    const tagKey = await this.getSpaceKeyAndCheckRights(tagKeyId);
    return this.tagKeyService.publishTagKey(tagKey);
  }

  async checkIfTagKeyExists(tagKeyTechnicalName: string): Promise<boolean> {
    return await this.tagKeyService.checkTagKeyExists(tagKeyTechnicalName);
  }

  async deleteTagKey(tagKeyId: string): Promise<HnTagKey> {
    const tagKey = await this.getSpaceKeyAndCheckRights(tagKeyId);
    if (tagKey.publishedAt) return this.tagKeyService.deprecateTagKey(tagKey);
    return this.tagKeyService.deleteTagKey(tagKey);
  }

  //////////////////////////////// TAG VALUE ////////////////////////////////
  async getTagValuesByTagKeyId(tagKeyId: string, page: number, size: number): Promise<ClPage<HnTagValue>> {
    const tagKey = await this.getTagKeyById(tagKeyId);
    if (!tagKey) {
      throw new Error('Tag key not found');
    }
    return this.tagValueService.getTagValuesByTagKeyId(tagKeyId, page, size);
  }

  async createTagValue(id: string, createTagValue: HnEditTagValueDto): Promise<HnTagValue> {
    const tagKey = await this.getSpaceKeyAndCheckRights(id);
    this.verifyTagValue(tagKey, createTagValue.additionalInfos);
    if (await this.tagValueService.checkTagValueExists(tagKey.id, createTagValue.value)) {
      throw new Error('A tag value with this value already exist');
    }
    return this.tagValueService.createTagValue(tagKey, createTagValue);
  }

  async updateTagValue(id: string, editTagValueDto: HnEditTagValueDto): Promise<HnTagValue> {
    if (!editTagValueDto.id) throw new Error('Tag value id is required');
    const tagKey = await this.getSpaceKeyAndCheckRights(id);
    this.verifyTagValue(tagKey, editTagValueDto.additionalInfos);
    return this.tagValueService.updateTagValue(tagKey, editTagValueDto);
  }

  async deleteTagValue(tagKeyId: string, tagValueId: string): Promise<HnTagValue> {
    const tagKey = await this.getSpaceKeyAndCheckRights(tagKeyId);
    if (tagKey.publishedAt) return this.tagValueService.deprecatedTagValue(tagKeyId, tagValueId);
    return this.tagValueService.deleteTagValue(tagValueId);
  }

  private verifyTagValue(tagKey: HnTagKey, additionalInfos: Record<string, any>): void {
    if (tagKey.additionalInfosSpecs) {
      for (const key in tagKey.additionalInfosSpecs) {
        if (!tagKey.additionalInfosSpecs[key].optional && !additionalInfos[key]) {
          throw new Error(`Missing additional info ${key}`);
        }
      }
    }
  }

  //////////////////////////////// OTHERS ////////////////////////////////

  private async getSpaceKeyAndCheckRights(tagKeyId: string): Promise<HnTagKey> {
    const tagKey = await this.tagKeyService.getTagKeyById(tagKeyId);
    if (!tagKey) {
      throw new Error('Tag key not found');
    }
    await this.assertRightsToEditTagKey(tagKey);
    return tagKey;
  }

  private async getSpaceById(spaceId: string): Promise<HnSpace> {
    await this.spaceAggregateService.assertCheckSpaceUser(spaceId, HnCurrentUserHelper.getCurrentUser()?.id);
    const space = await this.spaceAggregateService.findSpaceById(spaceId);
    if (!space) {
      throw new Error('Space not found');
    }
    return space;
  }

  private async assertRightsToEditTagKey(tagKey: HnTagKey): Promise<void> {
    const currentUser = HnCurrentUserHelper.getCurrentUser();
    if (!currentUser) {
      throw new Error('You must be logged in to edit a tag key');
    }
    if (tagKey.space && !(await this.spaceAggregateService.checkSpaceUser(tagKey.space.id, currentUser.id))) {
      throw new Error('You do not have the rights to edit this tag key');
    }
    if (
      tagKey.createdBy.id !== currentUser.id &&
      !tagKey.tagCoAuthors.some((tagCoAuthor) => tagCoAuthor.user.id === currentUser.id)
    ) {
      throw new Error('You do not have the rights to edit this tag key');
    }
  }

  private async checkIfTagHasValues(tagKey: HnTagKey): Promise<boolean> {
    return this.tagValueService.checkTagHasValues(tagKey.id);
  }
}
