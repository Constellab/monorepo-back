import {
  BlBadRequestException,
  BlNotFoundException,
  BlSearchSortCriteria,
  BlUnauthorizedException,
} from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import { TeRichTextDTO } from '@monorepo/te-text-editor';
import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { DataSource } from 'typeorm';

import { HnSiteMapEnumChangefreq, HnSitemapItemBase } from '../core/model/config/hn-site-map.class';
import { HnFrontService } from '../core/service/hn-front.service';
import { HnCurrentUserHelper } from '../core/utils/hn-current-user.helper';
import { HnSpaceAggregateService } from '../space-aggregate/hn-space-aggregate.service';
import { HnSpace } from '../space-aggregate/space/hn-space.entity';
import { HnUser } from '../users/hn-user.entity';
import { HnTagSecurity } from './security/hn-tag.security';
import { HnTagCoAuthorService } from './tag-co-author/hn-tag-co-author.service';
import { HnCreateTagKeyDto, HnTagKeyForLabDto } from './tag-key/hn-tag-key.dto';
import {
  HnTagKey,
  HnTagKeyAdditionalInfosSpecs,
  HnTagKeyType,
  HnTagParamSpec,
} from './tag-key/hn-tag-key.entity';
import { HnTagKeyService } from './tag-key/hn-tag-key.service';
import { HnEditTagValueDto, HnTagValueForLabDto } from './tag-value/hn-tag-value.dto';
import { HnTagValue } from './tag-value/hn-tag-value.entity';
import { HnTagValueService } from './tag-value/hn-tag-value.service';

@Injectable()
export class HnTagAggregateService {
  constructor(
    private readonly spaceAggregateService: HnSpaceAggregateService,
    private readonly tagCoAuthorService: HnTagCoAuthorService,
    private readonly tagKeyService: HnTagKeyService,
    private readonly tagValueService: HnTagValueService,
    private readonly frontService: HnFrontService,
    private readonly tagSecurity: HnTagSecurity,
    private dataSource: DataSource
  ) {}

  async findAllMap(): Promise<HnSitemapItemBase[]> {
    const tagKeys = await this.tagKeyService.findAllPublishedTagKeys();
    return tagKeys.map((tagKey) => {
      return {
        url: this.frontService.getTagUrl(tagKey.id, tagKey.technicalName),
        lastmod: tagKey.lastModifiedAt.toFormat('yyyy-MM-dd'),
        changefreq: HnSiteMapEnumChangefreq.MONTHLY,
        priority: 0.7,
      };
    });
  }

  async getAllTagKeysWithFiltersForLab(
    spacesFilter: string[],
    technicalNameFilter: string,
    labelFilter: string,
    page: number,
    size: number,
    personalOnly: boolean = false
  ): Promise<ClPage<HnTagKey>> {
    const currentUser = HnCurrentUserHelper.getAndCheckCurrentUser();
    return this.getAllTagKeysWithFilters(
      spacesFilter,
      technicalNameFilter,
      labelFilter,
      [],
      page,
      size,
      currentUser,
      personalOnly
    );
  }

  async getAllTagKeysWithFilters(
    spacesFilter: string[],
    technicalNameFilter: string,
    labelFilter: string,
    sortsCriteria: BlSearchSortCriteria[],
    page: number,
    size: number,
    user: HnUser | null = null,
    personalOnly: boolean = false
  ): Promise<ClPage<HnTagKey>> {
    const currentUser = user ?? HnCurrentUserHelper.getCurrentUser();
    let publicSelected = false;
    let myTagKeysSelected = false;
    for (const spaceId of spacesFilter) {
      if (spaceId === 'public') publicSelected = true;
      else if (spaceId === 'my-tag-keys') myTagKeysSelected = true;
      else {
        if (currentUser == null) {
          throw new BlUnauthorizedException('You must be logged in to filter by space');
        }
        await this.spaceAggregateService.assertCheckSpaceUser(spaceId, currentUser.id);
      }
    }
    let userSpacesIds: string[] | null = null;
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
      technicalNameFilter,
      labelFilter,
      publicSelected,
      myTagKeysSelected,
      personalOnly,
      sortsCriteria,
      page,
      size,
      user,
      userSpacesIds,
      coAuthorTagKeysIds
    );
  }

  async getTagValue(technicalName: string, valueId: string): Promise<HnTagValue | null> {
    const tagKey = await this.getTagKeyByTechnicalName(technicalName, false);
    if (!tagKey) {
      return null;
    }
    return this.tagValueService.getTagValueById(valueId);
  }

  async getTagKeyByTechnicalName(technicalName: string, strict?: true): Promise<HnTagKey>;
  async getTagKeyByTechnicalName(technicalName: string, strict: boolean): Promise<HnTagKey | null>;
  async getTagKeyByTechnicalName(technicalName: string, strict: boolean = true): Promise<HnTagKey | null> {
    const currentUser = HnCurrentUserHelper.getCurrentUser();
    let userSpacesIds: string[];
    if (currentUser) {
      userSpacesIds = (await this.spaceAggregateService.findSpacesOfUser(currentUser?.id)).map(
        (space) => space.id
      );
    } else {
      userSpacesIds = [];
    }
    const tagKey = await this.tagKeyService.getTagKeyByTechnicalName(technicalName, userSpacesIds);
    if (strict && !tagKey) {
      throw new BlNotFoundException('Tag key not found');
    }
    return tagKey;
  }

  async getTagKeyById(id: string): Promise<HnTagKey> {
    const currentUser = HnCurrentUserHelper.getCurrentUser();
    let tagKey: HnTagKey | null;
    if (currentUser) {
      const userSpacesIds = (await this.spaceAggregateService.findSpacesOfUser(currentUser?.id)).map(
        (space) => space.id
      );
      tagKey = await this.tagKeyService.getTagKeyByIdWithUserSpacesIds(id, userSpacesIds);
    } else {
      tagKey = await this.tagKeyService.getPublicTagKeyById(id);
    }
    if (!tagKey) {
      throw new BlNotFoundException('Tag key not found');
    }
    return tagKey;
  }

  async createTagKey(createTagKeyDto: HnCreateTagKeyDto): Promise<HnTagKey> {
    if (await this.checkIfTagKeyExists(createTagKeyDto.technicalName)) {
      throw new BlBadRequestException('A tag with this technical name already exist');
    }
    let space: HnSpace | null = null;
    if (createTagKeyDto.space) {
      space = await this.getSpaceById(createTagKeyDto.space);
    }
    return await this.dataSource.transaction(async (entityManager) => {
      const tagKey = await this.tagKeyService.createTagKey(createTagKeyDto, space ?? undefined, entityManager);
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
    let space: HnSpace | null = null;
    if (updateTagKeyDto.space) {
      space = await this.getSpaceById(updateTagKeyDto.space);
    }
    if (!updateTagKeyDto.id) throw new BlBadRequestException('Tag key id is required');
    const tagKey = await this.getTagKeyAndCheckRights(updateTagKeyDto.id);
    return await this.tagKeyService.updateTagKey(tagKey, updateTagKeyDto, space ?? undefined);
  }

  async updateTagKeyDescription(tagKeyId: string, description: TeRichTextDTO): Promise<HnTagKey> {
    const tagKey = await this.getTagKeyAndCheckRights(tagKeyId);
    return this.tagKeyService.updateDescription(tagKey, description);
  }

  async createAdditionalInfoSpec(
    technicalName: string,
    specName: string,
    spec: HnTagParamSpec
  ): Promise<HnTagKeyAdditionalInfosSpecs> {
    const tagKey = await this.getTagKeyByTechnicalName(technicalName);
    const additionalInfosSpecs: HnTagKeyAdditionalInfosSpecs = tagKey.additionalInfosSpecs || {};
    if (additionalInfosSpecs[specName]) {
      throw new BlBadRequestException(`Additional info spec '${specName}' already exists`);
    }
    additionalInfosSpecs[specName] = spec;
    additionalInfosSpecs[specName]['visibility'] = 'public'; // Default visibility for additional info specs
    if (!spec.optional && (await this.checkIfTagHasValues(tagKey))) {
      throw new BlBadRequestException(`There are already tag values for this tag,
       you cannot add a required additional info spec`);
    }
    return this.tagKeyService.updateAdditionalInfosSpecs(tagKey, additionalInfosSpecs);
  }

  async updateAdditionalInfoSpec(
    technicalName: string,
    specName: string,
    spec: HnTagParamSpec
  ): Promise<HnTagKeyAdditionalInfosSpecs> {
    const tagKey = await this.getTagKeyByTechnicalName(technicalName);
    const additionalInfosSpecs: HnTagKeyAdditionalInfosSpecs | undefined = tagKey.additionalInfosSpecs;
    if (!additionalInfosSpecs || !(specName in additionalInfosSpecs)) {
      throw new BlNotFoundException(`Additional info spec ${specName} does not exist`);
    }
    additionalInfosSpecs[specName] = spec;
    additionalInfosSpecs[specName]['visibility'] = 'public'; // Default visibility for additional info specs
    return this.tagKeyService.updateAdditionalInfosSpecs(tagKey, additionalInfosSpecs);
  }

  async renameAndEditAdditionalInfoSpec(
    technicalName: string,
    oldName: string,
    newName: string,
    spec: HnTagParamSpec
  ): Promise<HnTagKeyAdditionalInfosSpecs> {
    const tagKey = await this.getTagKeyByTechnicalName(technicalName);
    const additionalInfosSpecs: HnTagKeyAdditionalInfosSpecs | undefined = tagKey.additionalInfosSpecs;
    if (!additionalInfosSpecs || !(oldName in additionalInfosSpecs)) {
      throw new BlNotFoundException(`Additional info spec ${oldName} does not exist`);
    }
    if (newName !== oldName && additionalInfosSpecs[newName]) {
      throw new BlBadRequestException(`Additional info spec ${newName} already exists`);
    }
    delete additionalInfosSpecs[oldName];
    additionalInfosSpecs[newName] = spec;
    additionalInfosSpecs[newName]['visibility'] = 'public'; // Default visibility for additional info specs
    return this.tagKeyService.updateAdditionalInfosSpecs(tagKey, additionalInfosSpecs);
  }

  async deleteAdditionalInfoSpec(
    technicalName: string,
    additionalInfoSpecName: string
  ): Promise<HnTagKeyAdditionalInfosSpecs> {
    const tagKey = await this.getTagKeyByTechnicalName(technicalName);
    const additionalInfosSpecs: HnTagKeyAdditionalInfosSpecs | undefined = tagKey.additionalInfosSpecs;
    if (!additionalInfosSpecs || !(additionalInfoSpecName in additionalInfosSpecs)) {
      throw new BlNotFoundException(`Additional info spec ${additionalInfoSpecName} does not exist`);
    }
    delete additionalInfosSpecs[additionalInfoSpecName];
    return this.tagKeyService.updateAdditionalInfosSpecs(tagKey, additionalInfosSpecs);
  }

  async publishTagKey(tagKeyId: string): Promise<HnTagKey> {
    const tagKey = await this.getTagKeyAndCheckRights(tagKeyId);
    return this.tagKeyService.publishTagKey(tagKey);
  }

  async checkIfTagKeyExists(tagKeyTechnicalName: string): Promise<boolean> {
    return await this.tagKeyService.checkTagKeyExists(tagKeyTechnicalName);
  }

  async deleteTagKey(tagKeyId: string): Promise<HnTagKey> {
    const tagKey = await this.getTagKeyAndCheckRights(tagKeyId);
    if (tagKey.publishedAt) return this.deprecateTagKey(tagKey);
    return this.tagKeyService.deleteTagKey(tagKey);
  }

  async deprecateTagKey(tagKey: HnTagKey): Promise<HnTagKey> {
    return this.dataSource.transaction(async (entityManager) => {
      const tagValues = await this.tagValueService.getAllTagValuesByTagKeyId(tagKey.id);
      for (const tagValue of tagValues) {
        await this.tagValueService.deprecatedTagValueWithEntityManager(tagValue, entityManager);
      }
      return this.tagKeyService.deprecateTagKey(tagKey, entityManager);
    });
  }

  //////////////////////////////// TAG VALUE ////////////////////////////////

  async getTagValuesByTagKeyId(tagKeyId: string, page: number, size: number): Promise<ClPage<HnTagValue>> {
    const tagKey = await this.getTagKeyById(tagKeyId);
    if (!tagKey) {
      throw new BlNotFoundException('Tag key not found');
    }
    return this.tagValueService.getTagValuesByTagKeyId(tagKey.id, page, size);
  }

  async getTagValuesCountByTagKeyId(tagKeyId: string): Promise<number> {
    const tagKey = await this.getTagKeyById(tagKeyId);
    if (!tagKey) {
      throw new BlNotFoundException('Tag key not found');
    }
    return this.tagValueService.getTagValuesCountByTagKeyId(tagKey.id);
  }

  async getAllTagValuesByTagKeyTechnicalName(technicalName: string): Promise<HnTagValue[]> {
    const tagKey = await this.getTagKeyByTechnicalName(technicalName);
    if (!tagKey) {
      return [];
    }
    return this.tagValueService.getAllTagValuesByTagKeyId(tagKey.id);
  }

  async getTagValuesByTagKeyTechnicalName(
    technicalName: string,
    page: number,
    size: number,
    strict: boolean = true
  ): Promise<ClPage<HnTagValue>> {
    const tagKey = await this.getTagKeyByTechnicalName(technicalName, false);
    if (!tagKey) {
      if (strict) {
        throw new BlNotFoundException('Tag key not found');
      }
      return new ClPage<HnTagValue>(true, false, 0, 0, 0, []);
    }
    return this.tagValueService.getTagValuesByTagKeyId(tagKey.id, page, size);
  }

  async createTagValue(id: string, createTagValue: HnEditTagValueDto): Promise<HnTagValue> {
    const tagKey = await this.getTagKeyAndCheckRights(id, true);
    this.verifyTagValue(tagKey, createTagValue.additionalInfos);
    if (await this.tagValueService.checkTagValueExists(tagKey.id, createTagValue.value)) {
      throw new BlBadRequestException('A tag value with this value already exist');
    }
    return this.tagValueService.createTagValue(tagKey, createTagValue);
  }

  async updateTagValue(id: string, editTagValueDto: HnEditTagValueDto): Promise<HnTagValue> {
    if (!editTagValueDto.id) throw new BlBadRequestException('Tag value id is required');
    const tagKey = await this.getTagKeyAndCheckRights(id, true);
    this.verifyTagValue(tagKey, editTagValueDto.additionalInfos);
    return this.tagValueService.updateTagValue(tagKey, editTagValueDto);
  }

  async deleteTagValue(tagKeyId: string, tagValueId: string): Promise<HnTagValue> {
    const tagKey = await this.getTagKeyAndCheckRights(tagKeyId, true);
    if (tagKey.publishedAt) return this.tagValueService.deprecatedTagValue(tagKeyId, tagValueId);
    return this.tagValueService.deleteTagValue(tagValueId);
  }

  private verifyTagValue(tagKey: HnTagKey, additionalInfos?: Record<string, any>): void {
    if (tagKey.additionalInfosSpecs) {
      for (const key in tagKey.additionalInfosSpecs) {
        if (!tagKey.additionalInfosSpecs[key].optional && !additionalInfos?.[key]) {
          throw new BlBadRequestException(`Missing additional info ${key}`);
        }
      }
    }
  }

  //////////////////////////////// OTHERS ////////////////////////////////

  async shareTagToCommunity(
    labTagKey: HnTagKeyForLabDto,
    labTagValues: HnTagValueForLabDto[],
    spaceId: string | null = null
  ): Promise<HnTagKey> {
    const currentUser = HnCurrentUserHelper.getAndCheckCurrentUser();
    if (!currentUser) {
      throw new BlUnauthorizedException('You must be logged in to share a tag key');
    }

    let space: HnSpace | null = null;
    if (spaceId) {
      space = await this.getSpaceById(spaceId);
      if (!space) {
        throw new BlBadRequestException('You can only share a tag key to a public space');
      }
    }

    const tagKey: HnTagKey = new HnTagKey();
    tagKey.id = labTagKey.id;
    if (space) {
      tagKey.technicalName = `sp_${space.id.split('-')[0]}_${labTagKey.key}`;
    } else {
      tagKey.technicalName = `pu_${labTagKey.key}`;
    }
    tagKey.label = labTagKey.label;
    tagKey.type = labTagKey.value_format;
    tagKey.deprecated = labTagKey.deprecated;
    tagKey.publishedAt = undefined;
    tagKey.description = labTagKey.description;
    tagKey.additionalInfosSpecs = labTagKey.additional_infos_specs;
    tagKey.space = space ?? undefined;
    tagKey.publishedAt = DateTime.now();

    return await this.dataSource.transaction(async (entityManager) => {
      const savedTagKey = await this.tagKeyService.saveTagKeyWithEntityManager(tagKey, entityManager);

      for (const tagValueDto of labTagValues) {
        const tagValue = new HnTagValue();
        tagValue.id = tagValueDto.id;
        tagValue.value = tagValueDto.value;
        tagValue.deprecated = tagValueDto.deprecated;
        tagValue.shortDescription = tagValueDto.short_description;
        tagValue.additionalInfos = tagValueDto.additional_infos;
        tagValue.tagKey = savedTagKey;

        await this.tagValueService.saveTagValueWithEntityManager(tagValue, entityManager);
      }
      return savedTagKey;
    });
  }

  private async getTagKeyAndCheckRights(
    tagKeyId: string,
    assertNotDeprecated: boolean = false
  ): Promise<HnTagKey> {
    const tagKey = await this.tagKeyService.getTagKeyById(tagKeyId);
    if (!tagKey) {
      throw new BlNotFoundException('Tag key not found');
    }
    const currentUser = HnCurrentUserHelper.getAndCheckCurrentUser();
    await this.tagSecurity.assertCanEdit(tagKey, currentUser);
    if (assertNotDeprecated && tagKey.deprecated) {
      throw new BlBadRequestException('Tag key is deprecated');
    }
    return tagKey;
  }

  private async getSpaceById(spaceId: string): Promise<HnSpace> {
    await this.spaceAggregateService.assertCheckSpaceUser(
      spaceId,
      HnCurrentUserHelper.getAndCheckCurrentUser().id
    );
    const space = await this.spaceAggregateService.findSpaceById(spaceId);
    if (!space) {
      throw new BlNotFoundException('Space not found');
    }
    return space;
  }

  private async checkIfTagHasValues(tagKey: HnTagKey): Promise<boolean> {
    return this.tagValueService.checkTagHasValues(tagKey.id);
  }
}
