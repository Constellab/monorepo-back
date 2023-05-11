import {HnBaseEntity} from '../../core/model/entities/hn-base.entity';
import {BlEntityWithId} from '@monorepo/back-core-lib';
import {HnFolder} from './hn-folder.entity';

export class HnNode extends HnBaseEntity {
  name: string;

  order: number;

  path: string;

  completePath: string;

  parentId: string;

  children?: HnNode[];

  constructor(id: string, name: string, path: string, completePath: string, o: number, parentId?: string, children?: HnNode[]) {
    super();
    this.id = id;
    this.name = name;
    this.order = o;
    this.path = path;
    this.parentId = parentId ? parentId : null;
    this.completePath = completePath;
    if (children && children.length > 0) {
      this.children = children;
    }
  }
}

export class HnNodeDTO extends BlEntityWithId {
  title: string;
  path: string;
  folder?: HnFolder;
  folderId?: string;
  isFolder: boolean;
  order?: number;
}
