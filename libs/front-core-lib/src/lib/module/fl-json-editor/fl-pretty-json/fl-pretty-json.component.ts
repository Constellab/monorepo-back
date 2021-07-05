import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, TrackByFunction} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {ClCoerceBooleanDecorator, ClHelpService, ClOnChange} from '@monorepo/core-lib';
import {Observable, Subscription} from 'rxjs';
import {FlKeyboardKey} from '../../../utils/fl-keyboard.helper';
import {FlFlatTreeControl} from '../../../model/fl-flat-tree-control.class';

class ObjectNode {
  id: number;
  children?: ObjectNode[];
  key: string;
  value?: any;
  type: string;
  preview ?: string;
}

interface ObjectFlatNode {
  id: number;
  expandable: boolean;
  level: number;
  key: string;
  value?: any;
  type: string;
  preview?: string;
}

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

  startChar: string;
  endChar: string;

  treeControl: FlFlatTreeControl<ObjectFlatNode>;

  dataSource: MatTreeFlatDataSource<ObjectNode, ObjectFlatNode>;

  error: boolean = false;

  selectedNode: ObjectFlatNode;

  private componentIsInitiated: boolean = false;
  private subscription: Subscription;

  private id: number = 0;

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


  constructor(private cdr: ChangeDetectorRef) {
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
      const convertedObject: any = this.initObject(object);

      this.startChar = this.getStartChar(convertedObject);
      this.endChar = this.getEndChar(convertedObject);

      const data = this.buildFileTree(convertedObject, 0);
      console.log(this.object);

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

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `ObjectNode`.
   * @param obj object to convert to ObjectNode
   * @param level level of the hierarchy
   * @param keyOffset used when object is an array to set an offset for the array index (use for big array split)
   * @private
   */
  private buildFileTree(obj: any, level: number, keyOffset: number = 0): ObjectNode[] {
    const nodes: ObjectNode[] = [];


    // case for the array that are bigger than the maxSubObjectView
    if (Array.isArray(obj) && obj.length > this.maxSubObjectView) {
      let i = 0;
      // use to split the array in multiple section of maxSubObjectView size
      while (i < obj.length) {
        const max = Math.min(i + this.maxSubObjectView - 1, obj.length - 1);

        // define node and node properties
        const node = new ObjectNode();
        node.id = this.id++;
        node.key = `[${i}...${max}]`;
        node.type = 'object';
        node.preview = null;

        // build the sub array section
        node.children = this.buildFileTree(obj.slice(i, max + 1), level + 1, i);

        nodes.push(node);
        i += this.maxSubObjectView;
      }

      return nodes;
    }

    // for small arrays, or simple json object
    for (const key of Object.keys(obj)) {
      const value: any = obj[key] instanceof Map ? this.mapToJson(obj[key]) : obj[key];

      const node = new ObjectNode();
      node.id = this.id++;

      // set the node key, if there is an key offset, add it to the key
      node.key = keyOffset > 0 ? (parseInt(key) + keyOffset).toString() : key;

      if (value != null) {
        node.type = typeof value;
        if (node.type === 'object') {
          node.preview = this.getPreview(value);

          // build the sub objects
          node.children = this.buildFileTree(value, level + 1);
        } else {
          node.value = value;
        }
      }

      nodes.push(node);
    }

    return nodes;
  }

  // get the preview text of complexe object (json object or array)
  private getPreview(object: any): string {
    let preview: string = this.getStartChar(object);
    let count = 0;
    const keys: string[] = Object.keys(object);

    for (const key of keys) {
      const value: any = object[key];


      if (count > 0) {
        preview += ', ';
      }

      if (count < this.previewMaxObjectShowed) {

        // if the object is an array, don't show the key
        if (!Array.isArray(object)) {
          preview += key + ': ';
        }

        if (typeof value === 'object') {
          preview += '{...}';
        } else {
          preview += value;
        }
      } else {
        preview += '...';
        break;
      }

      count++;
    }

    if (preview.length > this.previewMaxTextLength) {
      preview = preview.substr(0, this.previewMaxTextLength) + '...';
    }

    preview += this.getEndChar(object);

    return preview;
  }

  // prepare and convert the object to json
  private initObject(object: any): any {
    // if the object is a map
    if (object instanceof Map) {
      return this.mapToJson(object);
    }
    // if the object is an array of an object, don't change it
    if (Array.isArray(object) || typeof object === 'object') {
      return object;
      // if this is a string,
    } else if (typeof object === 'string') {

      // check if the string is parsable
      const firstCarac: string = object[0];
      const lastCarac: string = object[object.length - 1];
      if ((firstCarac === '{' || firstCarac === '[') &&
        (lastCarac === '}' || lastCarac === ']')) {
        try {
          return JSON.parse(object);
        } catch (e) {
        }
      }

      return object.split('\n');
    } else {
      console.error('Wrong object format ', object);
      throw new Error();
    }
  }

  private getStartChar(object: any): string {
    if (Array.isArray(object)) {
      return '[';
    } else if (typeof object === 'object') {
      return '{';
    }

    return '';
  }

  private getEndChar(object: any): string {
    if (Array.isArray(object)) {
      return ']';
    } else if (typeof object === 'object') {
      return '}';
    }

    return '';
  }

  get paddingIndent(): number {
    return this.dense ? 10 : 20;
  }

  get denseClass(): string {
    return this.dense ? 'dense' : 'normal';
  }


  // convert a map to a json object
  private mapToJson(map: Map<any, any>): any {
    const object: any = {};
    map.forEach((value, key) => object[key.toString()] = value);
    return object;
  }


  ////////////////////////////// NODE SELECTION & KEY LISTENERS //////////////////////////
  onKeyDown(event: KeyboardEvent): void {
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
      if(!parentSelected){
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


  private selectParentNode(node: ObjectFlatNode): boolean {
    const parent: ObjectFlatNode = this.treeControl.getAncestor(node);
    if (parent) {
      this.selectedNode = parent;
      this.cdr.markForCheck();
      return true;
    }
    return false;
  }

  selectNode(node: ObjectFlatNode): void {
    this.selectedNode = node;
  }

  unselectNode(): void {
    this.selectedNode = null;
  }


  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}

