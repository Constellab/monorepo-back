import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {LabTypedTree} from '../../../../model/global/lab-typed-tree.class';
import {LabTypeEntity, LabTypeEntityTree} from '../../../../model/entities/lab-type/lab-type.entity';

interface LabProcessTypeTreeFlat {
  expandable: boolean;
  level: number;
  typePart: string;
  process?: LabTypeEntity;
}

/**
 * Show the process types in a tree based on the team and possibility to select it
 */
@Component({
  selector: 'lab-process-types-tree',
  templateUrl: './lab-process-types-tree.component.html',
  styleUrls: ['./lab-process-types-tree.component.scss']
})
export class LabProcessTypesTreeComponent implements OnInit {

  @Input() processTypesTree: LabTypeEntityTree[];

  @Output() processTypeClick: EventEmitter<LabTypeEntity> = new EventEmitter();
  @Output() processTypeDblClick: EventEmitter<LabTypeEntity> = new EventEmitter();

  treeControl: FlatTreeControl<LabProcessTypeTreeFlat>;
  dataSource: MatTreeFlatDataSource<LabTypedTree<LabTypeEntity>, LabProcessTypeTreeFlat>;


  private _transformer = (node: LabTypedTree<LabTypeEntity>, level: number): LabProcessTypeTreeFlat => {

    return {
      expandable: node.hasChildren(),
      level: level,
      typePart: node.typePart,
      process: node.hasChildren() ? null : node.object
    };
  };

  hasChild = (_: number, node: LabProcessTypeTreeFlat): boolean => node.expandable;

  constructor() {
  }

  ngOnInit(): void {
    this.initTree();
  }

  private initTree(): void {
    const reducedTree: LabTypedTree<LabTypeEntity>[]
      = this.processTypesTree.map(processType => processType.reduceHierarchy());

    this.treeControl = new FlatTreeControl<LabProcessTypeTreeFlat>(
      node => node.level, node => node.expandable);

    // object to flatten tree
    const treeFlattener: MatTreeFlattener<LabTypeEntityTree, LabProcessTypeTreeFlat> = new MatTreeFlattener(
      this._transformer, node => node.level, node => node.expandable,
      node => node.subTrees);

    // create the datasource and set data
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, treeFlattener);
    this.dataSource.data = reducedTree;

    // if there is only one main module
    if (reducedTree.length === 1) {
      // expand it
      this.treeControl.expand(this.treeControl.dataNodes[0]);
    }
  }

  clickProcess(node: LabProcessTypeTreeFlat): void {
    this.processTypeClick.emit(node.process);
  }


  dblClickProcess(node: LabProcessTypeTreeFlat): void {
    this.processTypeDblClick.emit(node.process);
  }

}
