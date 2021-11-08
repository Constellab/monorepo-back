import {MatTreeFlatDataSource} from '@angular/material/tree';
import {FlEntity} from '@monorepo/front-core-lib';

export class DaNode{
  id: string;

  path: string;

  name: string;

  order: number;

  children?: DaNode[];
}

export class EntityWithPotentialsChildren<T> implements FlEntity{
  id: string;
  children?: T[];
}


export class DaMateTreeFlatDataSource<T extends EntityWithPotentialsChildren<T>, F, K = F> extends MatTreeFlatDataSource<T, F, K>{

  //Create Node
  createNode(parent: any, node: any): void{

  }

  //Delete Node
  deleteNode(nodes: T[], id: string): [any[], boolean] {
    nodes.map(node => {
      if(node.id == id){
        nodes.splice(nodes.indexOf(node), 1);
        return [nodes, true];
      }
      else{
        if(typeof node.children !== 'undefined'){
          let r:boolean;
          [node.children, r] = this.deleteNode(node.children, id);
          console.log([node.children, r]);
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
