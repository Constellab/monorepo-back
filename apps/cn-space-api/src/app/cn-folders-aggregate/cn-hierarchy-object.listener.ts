import { Injectable } from '@nestjs/common';
import { CnHierarchyObjectService } from './cn_hierarchy_objects/cn-hierarchy-object.service';
import { OnEvent } from '@nestjs/event-emitter';
import { CnHierarchyObjectEvent, cnHierarchyObjectEventName } from './cn-hierarchy-object.event';
import { CnHierarchyObject } from './cn_hierarchy_objects/cn-hierarchy-object.entity';
import { CnHierarchyObjectTagAggregateService } from './cn-hierarchy-object-tags/cn-hierarchy-object-tag-aggregate.service';

@Injectable()
export class CnHierarchyObjectListener {
  constructor(
    private hierarchyObjectService: CnHierarchyObjectService,
    private hierarchyObjectTagService: CnHierarchyObjectTagAggregateService
  ) {}

  @OnEvent(cnHierarchyObjectEventName)
  async handleHierarchyObjectEvent(event: CnHierarchyObjectEvent): Promise<void> {
    if (event.type === 'TAG_MODIFIED') {
      console.log('TAG_MODIFIED event received');
      await this.refreshHierarchyObjectLastTags(event.hierarchyObject);
    }
  }

  /**
   * Store the last 4 tags of the hierarchy object in the hierarchy object directly
   * @param hierarchyObject
   * @private
   */
  private async refreshHierarchyObjectLastTags(hierarchyObject: CnHierarchyObject): Promise<void> {
    const tags = await this.hierarchyObjectTagService.findByHierarchyObjectPaginated(hierarchyObject, 0, 4);
    await this.hierarchyObjectService.updateLastTags(hierarchyObject, tags.objects);
  }
}
