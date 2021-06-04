import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BioxProcessType, BioxProcessTypedTree} from '../../../../model/entities/biox-process-type.entity';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';

interface BioxProcessTypeTreeFlat {
  expandable: boolean;
  level: number;
  ptypePart: string;
  processType?: BioxProcessType;
}

/**
 * Show the process type in a tree
 */
@Component({
  selector: 'gen-biox-process-types-tree',
  templateUrl: './biox-process-types-tree.component.html',
  styleUrls: ['./biox-process-types-tree.component.scss']
})
export class BioxProcessTypesTreeComponent implements OnInit {

  @Input() processTypesTree: BioxProcessTypedTree[];

  @Output() processTypesClick: EventEmitter<BioxProcessType> = new EventEmitter();
  @Output() processTypesDblClick: EventEmitter<BioxProcessType> = new EventEmitter();

  treeControl: FlatTreeControl<BioxProcessTypeTreeFlat>;
  dataSource: MatTreeFlatDataSource<BioxProcessTypedTree, BioxProcessTypeTreeFlat>;


  private _transformer = (node: BioxProcessTypedTree, level: number): BioxProcessTypeTreeFlat => {
    return {
      expandable: node.hasChildren(),
      level: level,
      ptypePart: node.typePart,
      processType: node.hasChildren() ? null : node.object
    };
  };

  hasChild = (_: number, node: BioxProcessTypeTreeFlat): boolean => node.expandable;

  constructor() {
  }

  ngOnInit(): void {
    this.initTree();
  }

  private initTree(): void {
    this.treeControl = new FlatTreeControl<BioxProcessTypeTreeFlat>(
      node => node.level, node => node.expandable);

    // object to flatten tree
    const treeFlattener: MatTreeFlattener<BioxProcessTypedTree, BioxProcessTypeTreeFlat> = new MatTreeFlattener(
      this._transformer, node => node.level, node => node.expandable,
      node => node.subTrees);

    // create the datasource and set data
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, treeFlattener);
    this.dataSource.data = this.processTypesTree;

    // if there is only one main module
    if (this.processTypesTree.length === 1) {
      // expand it
      this.treeControl.expand(this.treeControl.dataNodes[0]);
    }
  }

  clickProcess(node: BioxProcessTypeTreeFlat): void {
    this.processTypesClick.emit(node.processType);
  }


  dblClickProcess(node: BioxProcessTypeTreeFlat): void {
    this.processTypesDblClick.emit(node.processType);
  }

}
