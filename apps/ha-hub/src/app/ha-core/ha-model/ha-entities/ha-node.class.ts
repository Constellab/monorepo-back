import {MatTreeFlatDataSource} from '@angular/material/tree';
import {FlEntity} from '@monorepo/front-core-lib';
import {Type} from 'class-transformer';
import {HaEntity} from './ha-entity.class';

export class HaNode{
  id: string;

  path: string;

  completePath: string;

  name: string;

  order: number;

  @Type(() => HaNode)
  children?: HaNode[];

  parentId: string;

  constructor(id: string, path: string, completePath: string, name: string, order: number, parentId: string, children?: HaNode[]) {
    this.id = id;
    this.path = path;
    this.completePath = completePath;
    this.name= name;
    this.order = order;
    this.parentId = parentId;
    if(children){
      this.children = children;
    }
  }

}

export class HaNodeDTO extends HaEntity{
  title: string;
  path: string;
  folderId?: string;
  isFolder?: boolean;
  type: HaNodeType;
}

export enum HaNodeType{
  DOC = 'doc',
  FOL = 'fol',
  TEC = 'TEC'
}

export class EntityWithPotentialsChildren<T> implements FlEntity{
  id: string;
  children?: T[];
}


export class HaMateTreeFlatDataSource<T extends EntityWithPotentialsChildren<T>, F, K = F> extends MatTreeFlatDataSource<T, F, K>{

  findNode(nodeId: string, data: T[]): T{
    const node: T = data.find(n => n.id == nodeId);
    if(node) {
      return node;
    }
    data.map(n => {
      return this.findNode(nodeId, n.children);
    });
    return null;
  }


}
