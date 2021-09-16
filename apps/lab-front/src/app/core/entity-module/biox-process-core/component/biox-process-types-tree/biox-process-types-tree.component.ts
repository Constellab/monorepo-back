import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {TypedTree} from '../../../../model/global/typed-tree.class';
import {BioxLabTypeEntity, BioxLabTypeEntityTree} from '../../../../model/entities/lab-type/biox-lab-type.entity';

interface BioxProcessTypeTreeFlat {
  expandable: boolean;
  level: number;
  typePart: string;
  process?: BioxLabTypeEntity;
}

/**
 * Show the process types in a tree based on the team and possibility to select it
 */
@Component({
  selector: 'gen-biox-process-types-tree',
  templateUrl: './biox-process-types-tree.component.html',
  styleUrls: ['./biox-process-types-tree.component.scss']
})
export class BioxProcessTypesTreeComponent implements OnInit {

  @Input() processTypesTree: BioxLabTypeEntityTree[];

  @Output() processTypeClick: EventEmitter<BioxLabTypeEntity> = new EventEmitter();
  @Output() processTypeDblClick: EventEmitter<BioxLabTypeEntity> = new EventEmitter();

  treeControl: FlatTreeControl<BioxProcessTypeTreeFlat>;
  dataSource: MatTreeFlatDataSource<TypedTree<BioxLabTypeEntity>, BioxProcessTypeTreeFlat>;


  private _transformer = (node: TypedTree<BioxLabTypeEntity>, level: number): BioxProcessTypeTreeFlat => {

    return {
      expandable: node.hasChildren(),
      level: level,
      typePart: node.typePart,
      process: node.hasChildren() ? null : node.object
    };
  };

  hasChild = (_: number, node: BioxProcessTypeTreeFlat): boolean => node.expandable;

  constructor() {
  }

  ngOnInit(): void {
    this.initTree();
  }

  private initTree(): void {
    const reducedTree: TypedTree<BioxLabTypeEntity>[]
      = this.processTypesTree.map(processType => processType.reduceHierarchy());

    this.treeControl = new FlatTreeControl<BioxProcessTypeTreeFlat>(
      node => node.level, node => node.expandable);

    // object to flatten tree
    const treeFlattener: MatTreeFlattener<BioxLabTypeEntityTree, BioxProcessTypeTreeFlat> = new MatTreeFlattener(
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

  clickProcess(node: BioxProcessTypeTreeFlat): void {
    this.processTypeClick.emit(node.process);
  }


  dblClickProcess(node: BioxProcessTypeTreeFlat): void {
    this.processTypeDblClick.emit(node.process);
  }

}
