import { CnHierarchyObject } from './cn_hierarchy_objects/cn-hierarchy-object.entity';

export const cnHierarchyObjectEventName = 'cn-hierarchy-object-event';

export interface CnHierarchyObjectEvent {
  type: 'TAG_MODIFIED';
  hierarchyObject: CnHierarchyObject;
}
