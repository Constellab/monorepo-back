import { Injectable } from '@nestjs/common';
import { CnHierarchyObjectTagService } from './cn-hierarchy-object-tag.service';
import { CnHierarchyObjectTagHistoryService } from './cn-hierarchy-object-tag-history.service';
import { CnHierarchyObjectTag } from './cn-hierarchy-object-tag.entity';
import { CnHierarchyObject } from '../cn_hierarchy_objects/cn-hierarchy-object.entity';
import { DataSource, EntityManager } from 'typeorm';
import { CnHierarchyObjectTagHistoryType } from './cn-hierarchy-object-tag-history.entity';
import { CnAvailableTags, CnTag, CnTagList } from './cn-hierarchy-object-tag.dto';
import { BlBadRequestException } from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CnHierarchyObjectEvent, cnHierarchyObjectEventName } from '../cn-hierarchy-object.event';

@Injectable()
export class CnHierarchyObjectTagAggregateService {
  constructor(
    private tagService: CnHierarchyObjectTagService,
    private historyService: CnHierarchyObjectTagHistoryService,
    private datasource: DataSource,
    private eventEmitter: EventEmitter2
  ) {}

  public async createTag(tag: CnTag, hierarchyObject: CnHierarchyObject): Promise<CnHierarchyObjectTag> {
    const newTag = await this.datasource.transaction(async (entityManager) =>
      this.createTagTransaction(tag, hierarchyObject, entityManager)
    );

    this.emitTagModifiedEvent(hierarchyObject);

    return newTag;
  }

  private async createTagTransaction(
    tag: CnTag,
    hierarchyObject: CnHierarchyObject,
    entityManager: EntityManager
  ): Promise<CnHierarchyObjectTag> {
    const tagEntity = await this.tagService.findByTag(tag.key, tag.value, hierarchyObject.id);
    if (tagEntity) {
      return tagEntity;
    }

    const entityTag = await this.tagService.createTag(tag, hierarchyObject, entityManager);
    await this.historyService.createHistory(
      tag,
      hierarchyObject,
      CnHierarchyObjectTagHistoryType.CREATED,
      entityManager
    );
    return entityTag;
  }

  public async deleteTag(tag: CnTag, hierarchyObject: CnHierarchyObject): Promise<void> {
    const entityTag = await this.tagService.findByTag(tag.key, tag.value, hierarchyObject.id);
    if (!tag) {
      return;
    }

    await this.datasource.transaction(async (entityManager) => {
      await this.deleteTagTransaction(entityTag, hierarchyObject, entityManager);
    });

    this.emitTagModifiedEvent(hierarchyObject);
  }

  public async deleteTags(tags: CnTag[], hierarchyObject: CnHierarchyObject): Promise<void> {
    await this.datasource.transaction(async (entityManager) => {
      for (const tag of tags) {
        const entityTag = await this.tagService.findByTag(tag.key, tag.value, hierarchyObject.id);
        if (entityTag) {
          await this.deleteTagTransaction(entityTag, hierarchyObject, entityManager);
        }
      }
    });

    this.emitTagModifiedEvent(hierarchyObject);
  }

  private async deleteTagTransaction(
    entityTag: CnHierarchyObjectTag,
    hierarchyObject: CnHierarchyObject,
    entityManager: EntityManager
  ): Promise<void> {
    await this.tagService.deleteById(entityTag.id, entityManager);
    await this.historyService.createHistory(
      { key: entityTag.key, value: entityTag.value },
      hierarchyObject,
      CnHierarchyObjectTagHistoryType.DELETED,
      entityManager
    );
  }

  /**
   * Create tags for a hierarchy object.
   * @param tags
   * @param hierarchyObject
   */
  public async createTags(
    tags: CnTag[],
    hierarchyObject: CnHierarchyObject
  ): Promise<CnHierarchyObjectTag[]> {
    const result = await this.datasource.transaction(async (entityManager) =>
      this.createTagsTransaction(tags, hierarchyObject, entityManager)
    );
    this.emitTagModifiedEvent(hierarchyObject);

    return result;
  }

  /**
   * Create tags for a hierarchy object.
   */
  public async createTagsTransaction(
    tags: CnTag[],
    hierarchyObject: CnHierarchyObject,
    entityManager: EntityManager
  ): Promise<CnHierarchyObjectTag[]> {
    const entityTags: CnHierarchyObjectTag[] = [];
    for (const tag of tags) {
      entityTags.push(await this.createTagTransaction(tag, hierarchyObject, entityManager));
    }

    return entityTags;
  }

  /**
   * Add or replace tags for a hierarchy object (replace if tag with same key already exists).
   * @param tags
   * @param hierarchyObject
   * @private
   */
  public async createOrReplaceTagsByKey(
    tags: CnTag[],
    hierarchyObject: CnHierarchyObject
  ): Promise<CnHierarchyObjectTag[]> {
    // check if there are multiples new tags with the same key
    const tagsMap = new Map<string, CnTag>();
    for (const tag of tags) {
      if (tagsMap.has(tag.key)) {
        throw new BlBadRequestException(`Multiple tags with the same key: ${tag.key}`);
      }
      tagsMap.set(tag.key, tag);
    }

    const result = await this.datasource.transaction(async (entityManager) => {
      const entityTags: CnHierarchyObjectTag[] = [];
      for (const tag of tags) {
        entityTags.push(await this.addOrReplaceTagByKey(tag, hierarchyObject, entityManager));
      }
      return entityTags;
    });

    this.emitTagModifiedEvent(hierarchyObject);
    return result;
  }

  private async addOrReplaceTagByKey(
    tag: CnTag,
    hierarchyObject: CnHierarchyObject,
    entityManager: EntityManager
  ): Promise<CnHierarchyObjectTag> {
    const tagsWithSameKey = await this.tagService.findByKeyAndHierarchyObject(tag.key, hierarchyObject.id);

    for (const tagWithSameKey of tagsWithSameKey) {
      await this.deleteTagTransaction(tagWithSameKey, hierarchyObject, entityManager);
    }

    return await this.createTagTransaction(tag, hierarchyObject, entityManager);
  }

  /**
   * Set tags for a hierarchy object (replace all existing tags).
   * If a tag with same key/value already exists, it is not replaced.
   * @param tags
   * @param hierarchyObject
   */
  public async setTags(tags: CnTag[], hierarchyObject: CnHierarchyObject): Promise<CnHierarchyObjectTag[]> {
    const existingTags = await this.tagService.findByHierarchyObject(hierarchyObject.id);

    const result = await this.datasource.transaction(async (entityManager) => {
      // first delete the tags
      const newTags = new CnTagList(tags);
      for (const tag of existingTags) {
        // delete the tag if it does not exist in the new tags
        if (!newTags.hasTag(tag)) {
          await this.deleteTagTransaction(tag, hierarchyObject, entityManager);
        }
      }

      // then create the new tags
      const existingTagList = new CnTagList(existingTags);
      const entityTags: CnHierarchyObjectTag[] = [];
      for (const tag of tags) {
        // create the tag if it does not exist in the existing tags
        if (!existingTagList.hasTag(tag)) {
          entityTags.push(await this.createTagTransaction(tag, hierarchyObject, entityManager));
        }
      }
      return entityTags;
    });

    this.emitTagModifiedEvent(hierarchyObject);
    return result;
  }

  private emitTagModifiedEvent(hierarchyObject: CnHierarchyObject): void {
    this.eventEmitter.emit(cnHierarchyObjectEventName, {
      type: 'TAG_MODIFIED',
      hierarchyObject,
    } as CnHierarchyObjectEvent);
  }

  /////////////////////////////////////////// FIND ///////////////////////////////////////////

  public async findAllByHierarchyObject(hierarchyObject: CnHierarchyObject): Promise<CnTag[]> {
    const tags = await this.tagService.findByHierarchyObject(hierarchyObject.id);
    return tags.map((tag) => ({ key: tag.key, value: tag.value }));
  }

  public async findByHierarchyObjectPaginated(
    hierarchyObject: CnHierarchyObject,
    page: number,
    size: number
  ): Promise<ClPage<CnTag>> {
    const result = await this.tagService.findByHierarchyObjectPaginated(hierarchyObject.id, page, size);
    return result.map((tag) => ({ key: tag.key, value: tag.value }));
  }

  public async getAvailableTagsInChildren(hierarchyObjectId: string): Promise<CnAvailableTags> {
    return this.tagService.getAvailableTagsInChildren(hierarchyObjectId);
  }
}
