import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {TypedTree} from '../../../../model/global/typed-tree.class';
import {BioxLabTypeEntity, BioxLabTypeEntityTree} from '../../../../model/entities/lab-type/biox-lab-type.entity';

interface BioxProcessableTypeTreeFlat {
  expandable: boolean;
  level: number;
  typePart: string;
  processable?: BioxLabTypeEntity;
}

/**
 * Show the processable types in a tree based on the team and possibility to select it
 */
@Component({
  selector: 'gen-biox-processable-types-tree',
  templateUrl: './biox-processable-types-tree.component.html',
  styleUrls: ['./biox-processable-types-tree.component.scss']
})
export class BioxProcessableTypesTreeComponent implements OnInit {

  @Input() processableTypesTree: BioxLabTypeEntityTree[];

  @Output() processableTypeClick: EventEmitter<BioxLabTypeEntity> = new EventEmitter();
  @Output() processableTypeDblClick: EventEmitter<BioxLabTypeEntity> = new EventEmitter();

  treeControl: FlatTreeControl<BioxProcessableTypeTreeFlat>;
  dataSource: MatTreeFlatDataSource<TypedTree<BioxLabTypeEntity>, BioxProcessableTypeTreeFlat>;


  private _transformer = (node: TypedTree<BioxLabTypeEntity>, level: number): BioxProcessableTypeTreeFlat => {

    return {
      expandable: node.hasChildren(),
      level: level,
      typePart: node.typePart,
      processable: node.hasChildren() ? null : node.object
    };
  };

  hasChild = (_: number, node: BioxProcessableTypeTreeFlat): boolean => node.expandable;

  constructor() {
  }

  ngOnInit(): void {
    this.initTree();
  }

  private initTree(): void {
    const reducedTree: TypedTree<BioxLabTypeEntity>[]
      = this.processableTypesTree.map(processableType => processableType.reduceHierarchy());

    this.treeControl = new FlatTreeControl<BioxProcessableTypeTreeFlat>(
      node => node.level, node => node.expandable);

    // object to flatten tree
    const treeFlattener: MatTreeFlattener<BioxLabTypeEntityTree, BioxProcessableTypeTreeFlat> = new MatTreeFlattener(
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

  clickProcessable(node: BioxProcessableTypeTreeFlat): void {
    this.processableTypeClick.emit(node.processable);
  }


  dblClickProcessable(node: BioxProcessableTypeTreeFlat): void {
    this.processableTypeDblClick.emit(node.processable);
  }

}
