import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BioxProcessableSpec} from '../../../../model/entities/processable-spec/biox-processable-spec.entity';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {TypedTree} from '../../../../model/global/tree-by-type.class';

interface BioxProcessableSpecTreeFlat {
  expandable: boolean;
  level: number;
  typePart: string;
  processable?: BioxProcessableSpec;
}

/**
 * Show the processable specs in a tree based on the team and possibility to select it
 */
@Component({
  selector: 'gen-biox-processable-specs-tree',
  templateUrl: './biox-processable-specs-tree.component.html',
  styleUrls: ['./biox-processable-specs-tree.component.scss']
})
export class BioxProcessableSpecsTreeComponent implements OnInit {

  @Input() processableSpecsTree: TypedTree<BioxProcessableSpec>[];

  @Output() processableSpecClick: EventEmitter<BioxProcessableSpec> = new EventEmitter();
  @Output() processableSpecDblClick: EventEmitter<BioxProcessableSpec> = new EventEmitter();

  treeControl: FlatTreeControl<BioxProcessableSpecTreeFlat>;
  dataSource: MatTreeFlatDataSource<TypedTree<BioxProcessableSpec>, BioxProcessableSpecTreeFlat>;


  private _transformer = (node: TypedTree<BioxProcessableSpec>, level: number): BioxProcessableSpecTreeFlat => {
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
    const treeFlattener: MatTreeFlattener<TypedTree<BioxProcessableSpec>, BioxProcessableSpecTreeFlat> = new MatTreeFlattener(
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
