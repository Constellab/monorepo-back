import {MatTreeFlatDataSource} from '@angular/material/tree';
import {FlEntity} from '@monorepo/front-core-lib';

export class DaNode{
  id: string;

  path: string;

  completePath: string;

  name: string;

  order: number;

  children?: DaNode[];

  parentId: string;

  constructor(id: string, path: string, completePath: string, name: string, order: number, parentId: string, children?: DaNode[]) {
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

class FlatNode {
  expandable: boolean;
  name: string;
  level: number;
  id: string;
}


export class EntityWithPotentialsChildren<T> implements FlEntity{
  id: string;
  children?: T[];
  parentId: string;
}


export class DaMateTreeFlatDataSource<T extends EntityWithPotentialsChildren<T>, F, K = F> extends MatTreeFlatDataSource<T, F, K>{

  //Create Node
  createNode(node: T): void{
    console.log(node);
    const parent: T = this.findNode(node.parentId, this.data);
    parent.children.push(node);
    console.log(this.data);
  }

  findNode(nodeId: string, data: T[]): T{
    const node: T = data.find(n => n.id == nodeId);
    if(!node){
      data.map(n => {
        return this.findNode(nodeId, n.children);
      });
      return null;
    } else {
      return node;
    }
  }

  //Delete Node
  deleteNode(nodes: T[], id: string): [T[], boolean] {
    nodes.map(node => {
      if(node.id == id){
        nodes.splice(nodes.indexOf(node), 1);
        return [nodes, true];
      }
      else{
        if(typeof node.children !== 'undefined'){
          let r:boolean;
          [node.children, r] = this.deleteNode(node.children, id);
          return [nodes, r]
        }
        else{
          return [nodes, false];
        }
      }
    })
    return [nodes, false];
  }


}
