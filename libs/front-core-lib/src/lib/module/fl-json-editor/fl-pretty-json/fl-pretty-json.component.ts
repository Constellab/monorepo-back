import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  TrackByFunction,
  ViewChild
} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {ClCoerceBooleanDecorator, ClHelpService, ClOnChange} from '@monorepo/core-lib';
import {Observable, Subscription} from 'rxjs';
import {FlKeyboardHelper, FlKeyboardKey} from '../../../utils/fl-keyboard.helper';
import {FlFlatTreeControl} from '../../../model/fl-flat-tree-control.class';
import {ObjectFlatNode, ObjectNode} from '../model/fl-pretty-json.class';
import {FlPrettyJsonBuilder} from '../model/fl-pretty-json-builder.class';
import {FlHtmlService} from '../../../service/fl-html.service';


@Component({
  selector: 'fl-pretty-json',
  templateUrl: './fl-pretty-json.component.html',
  styleUrls: ['./fl-pretty-json.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlPrettyJsonComponent implements OnInit, OnDestroy {


  /**
   * Json object to show, support observable
   */
  @ClOnChange(function (this: FlPrettyJsonComponent, value: any | Observable<any>) {
    if (this.componentIsInitiated) {
      this.init(value);
    }
  })
  @Input() object: any;

  /**
   * Number max of character in the json object preview
   */
  @Input() previewMaxTextLength: number = 100;

  /**
   * Number max of object showed in the preview (nb of attribute or nb of element in array)
   */
  @Input() previewMaxObjectShowed: number = 3;

  /**
   * Number max of sub object shown
   */
  @Input() maxSubObjectView: number = 100;

  /**
   * In dense mode, the text size and indent padding are smaller
   */
  @ClCoerceBooleanDecorator()
  @Input() dense: boolean | string;

  @ViewChild('container', {static: false}) container: ElementRef<HTMLElement>;

  startChar: string;
  endChar: string;

  treeControl: FlFlatTreeControl<ObjectFlatNode>;

  dataSource: MatTreeFlatDataSource<ObjectNode, ObjectFlatNode>;

  error: boolean = false;

  selectedNode: ObjectFlatNode;

  private componentIsInitiated: boolean = false;
  private subscription: Subscription;

  trackBy: TrackByFunction<{ id: any }> = ClHelpService.trackByIdFunction;

  private _transformer = (node: ObjectNode, level: number): ObjectFlatNode => {
    return {
      id: node.id,
      expandable: !!node.children && node.children.length > 0,
      level: level,
      key: node.key,
      value: node.value,
      preview: node.preview,
      type: node.type
    };
  };

  hasChild = (_: number, node: ObjectFlatNode): boolean => node.expandable;


  constructor(private cdr: ChangeDetectorRef,
              private htmlService: FlHtmlService) {
  }

  ngOnInit(): void {
    this.init(this.object);
    this.componentIsInitiated = true;
  }

  private init(object: any | Observable<any>): void {
    // unsubscribe previous subscription if it exists
    this.subscription?.unsubscribe();
    if (object instanceof Observable) {
      object.subscribe(
        json => this.initJson(json)
      );
    } else {
      this.initJson(object);
    }
  }

  private initJson(object: any): void {
    if (object == null) {
      this.startChar = 'null';
      this.endChar = '';
      return;
    }

    try {
      // prepare the object
      const builder: FlPrettyJsonBuilder = new FlPrettyJsonBuilder(this.object, this.previewMaxTextLength, this.previewMaxObjectShowed,
        this.maxSubObjectView);

      this.startChar = builder.getObjectStartChart();
      this.endChar = builder.getObjectEndChart();

      const data: ObjectNode[] = builder.buildObjectNodes();

      this.treeControl = new FlFlatTreeControl<ObjectFlatNode>(
        node => node.level, node => node.expandable);

      // object to flatten tree
      const treeFlattener: MatTreeFlattener<ObjectNode, ObjectFlatNode> = new MatTreeFlattener(
        this._transformer, node => node.level, node => node.expandable, node => node.children);

      // create the datasource and set data
      this.dataSource = new MatTreeFlatDataSource(this.treeControl, treeFlattener);
      this.dataSource.data = data;
      this.error = false;
    } catch (e) {
      this.error = true;
    }

    this.cdr.markForCheck();
  }


  get paddingIndent(): number {
    return this.dense ? 10 : 20;
  }

  get denseClass(): string {
    return this.dense ? 'dense' : 'normal';
  }

  ////////////////////////////// KEY LISTENERS //////////////////////////
  onKeyDown(event: KeyboardEvent): void {
    if (!FlKeyboardHelper.keyIsArrow(event.key)) {
      return;
    }

    ClHelpService.stopEventPropagation(event);
    const selectedNode: ObjectFlatNode = this.selectedNode ?? this.treeControl.dataNodes[0];


    switch (event.key) {
      case FlKeyboardKey.ARROW_DOWN:
        this.selectNextNode(selectedNode);
        break;
      case FlKeyboardKey.ARROW_UP:
        this.selectPreviousNode(selectedNode);
        break;
      case FlKeyboardKey.ARROW_LEFT:
        this.handleLeftArrow(selectedNode);
        break;
      case FlKeyboardKey.ARROW_RIGHT:
        this.handleRightArrow(selectedNode);
        break;
    }

    return;
  }

  private selectPreviousNode(node: ObjectFlatNode): void {
    const previousNode: ObjectFlatNode | null = this.treeControl.getPreviousVisibleNode(node);

    if (previousNode) {
      this.selectNode(previousNode);
    }
  }

  private selectNextNode(node: ObjectFlatNode): void {
    const nextNode: ObjectFlatNode | null = this.treeControl.getNextVisibleNode(node);

    if (nextNode) {
      this.selectNode(nextNode);
    }
  }

  // if the node is expandable and expended, collapse it
  // otherwise go to parent node or previous node if no parent
  private handleLeftArrow(node: ObjectFlatNode): void {
    if (node.expandable && this.treeControl.isExpanded(node)) {
      // collapse the node
      this.treeControl.collapse(node);
    }
    // select the parent
    else {
      const parentSelected = this.selectParentNode(node);
      // if there is no parent node, select the previous
      if (!parentSelected) {
        this.selectPreviousNode(node);
      }
    }
  }

  // if the node is expandable and collapse, expand it, otherwise go to next node
  private handleRightArrow(node: ObjectFlatNode): void {
    if (node.expandable && !this.treeControl.isExpanded(node)) {
      // expand the node
      this.treeControl.expand(node);
    }
    // select next node
    else {
      this.selectNextNode(node);
    }
  }

  ////////////////////////////// OTHERS //////////////////////////


  private selectParentNode(node: ObjectFlatNode): boolean {
    const parent: ObjectFlatNode = this.treeControl.getAncestor(node);
    if (parent) {
      this.selectNode(parent);
      this.cdr.markForCheck();
      return true;
    }
    return false;
  }

  selectNode(node: ObjectFlatNode): void {
    this.selectedNode = node;

    // get the node and check if it's in viewport, if note, scroll to element
    const nodeElement: HTMLElement = this.getNodeHtmlElement(node.id);
    if (nodeElement) {
      this.htmlService.scrollToElementIfNotVisible(nodeElement);
    }
  }

  unselectNode(): void {
    this.selectedNode = null;
  }

  getNodeUniqueClass(nodeId: number): string {
    return `node-${nodeId}`;
  }

  // retrieve the html element of a node
  private getNodeHtmlElement(nodeId: number): HTMLElement {
    return this.container.nativeElement.querySelector('.' + this.getNodeUniqueClass(nodeId));
  }


  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}

