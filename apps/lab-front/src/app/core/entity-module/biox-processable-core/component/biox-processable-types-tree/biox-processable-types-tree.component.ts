import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BioxProcessableType} from '../../../../model/entities/processable-spec/biox-processable-spec.entity';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {TypedTree} from '../../../../model/global/tree-by-type.class';

interface BioxProcessableSpecTreeFlat {
  expandable: boolean;
  level: number;
  typePart: string;
  processable?: BioxProcessableType;
}

/**
 * Show the processable specs in a tree based on the team and possibility to select it
 */
@Component({
  selector: 'gen-biox-processable-types-tree',
  templateUrl: './biox-processable-types-tree.component.html',
  styleUrls: ['./biox-processable-types-tree.component.scss']
})
export class BioxProcessableTypesTreeComponent implements OnInit {

  @Input() processableSpecsTree: TypedTree<BioxProcessableType>[];

  @Output() processableSpecClick: EventEmitter<BioxProcessableType> = new EventEmitter();
  @Output() processableSpecDblClick: EventEmitter<BioxProcessableType> = new EventEmitter();

  treeControl: FlatTreeControl<BioxProcessableSpecTreeFlat>;
  dataSource: MatTreeFlatDataSource<TypedTree<BioxProcessableType>, BioxProcessableSpecTreeFlat>;


  private _transformer = (node: TypedTree<BioxProcessableType>, level: number): BioxProcessableSpecTreeFlat => {
    return {
      expandable: node.hasChildren(),
      level: level,
      typePart: node.typePart,
      processable: node.hasChildren() ? null : node.object
    };
  };

  hasChild = (_: number, node: BioxProcessableSpecTreeFlat): boolean => node.expandable;

  constructor() {
  }

  ngOnInit(): void {
    this.initTree();
  }

  private initTree(): void {
    this.treeControl = new FlatTreeControl<BioxProcessableSpecTreeFlat>(
      node => node.level, node => node.expandable);

    // object to flatten tree
    const treeFlattener: MatTreeFlattener<TypedTree<BioxProcessableType>, BioxProcessableSpecTreeFlat> = new MatTreeFlattener(
      this._transformer, node => node.level, node => node.expandable,
      node => node.subTrees);

    // create the datasource and set data
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, treeFlattener);
    this.dataSource.data = this.processableSpecsTree;

    // if there is only one main module
    if (this.processableSpecsTree.length === 1) {
      // expand it
      this.treeControl.expand(this.treeControl.dataNodes[0]);
    }
  }

  clickProcessable(node: BioxProcessableSpecTreeFlat): void {
    this.processableSpecClick.emit(node.processable);
  }


  dblClickProcessable(node: BioxProcessableSpecTreeFlat): void {
    this.processableSpecDblClick.emit(node.processable);
  }

}
