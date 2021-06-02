import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {ClCoerceBooleanDecorator, ClOnChange} from '@monorepo/core-lib';

class ObjectNode {
  children?: ObjectNode[];
  key: string;
  value?: any;
  type: string;
  preview ?: string;
  information ?: string;
}

class ObjectFlatNode {
  expandable: boolean;
  level: number;
  key: string;
  value?: any;
  type: string;
  preview ?: string;
  information ?: string;
}

@Component({
  selector: 'fl-pretty-json',
  templateUrl: './fl-pretty-json.component.html',
  styleUrls: ['./fl-pretty-json.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlPrettyJsonComponent implements OnInit {


  @ClOnChange(function (this: FlPrettyJsonComponent, value: any) {
    if (this.componentIsInitiated) {
      this.initJson(value);
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
   * In dense mode, the text size and indent padding are smaller
   */
  @ClCoerceBooleanDecorator()
  @Input() dense: boolean | string;

  startChar: string;
  endChar: string;

  treeControl: FlatTreeControl<ObjectFlatNode>;


  dataSource: MatTreeFlatDataSource<ObjectNode, ObjectFlatNode>;

  componentIsInitiated: boolean = false;

  error: boolean = false;

  private _transformer = (node: ObjectNode, level: number): ObjectFlatNode => {
    return {
      expandable: !!node.children && node.children.length > 0,
      level: level,
      key: node.key,
      value: node.value,
      information: node.information,
      preview: node.preview,
      type: node.type
    };
  };

  hasChild = (_: number, node: ObjectFlatNode): boolean => node.expandable;


  constructor() {
  }

  ngOnInit(): void {
    this.initJson(this.object);
    this.componentIsInitiated = true;
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

      this.treeControl = new FlatTreeControl<ObjectFlatNode>(
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
  }

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `ObjectNode`.
   */
  private buildFileTree(obj: { [key: string]: any }, level: number): ObjectNode[] {

    let keys: any;

    if (obj instanceof Map) {
      keys = obj.keys();
    } else {
      keys = Object.keys(obj);
    }

    const nodes: ObjectNode[] = [];
    for (const key of keys) {
      let value: any;

      if (obj instanceof Map) {
        value = obj.get(key);
      } else {
        value = obj[key];
      }


      const node = new ObjectNode();
      node.key = key;

      if (value != null) {
        node.type = typeof value;
        if (node.type === 'object') {
          node.preview = this.getPreview(value);
          node.information = this.getInformation(value);
          node.children = this.buildFileTree(value, level + 1);
        } else {
          node.value = value;
        }
      }

      nodes.push(node);
    }

    return nodes;
  }

  private getInformation(object: any): string {
    let information: string;
    if (object instanceof Map) {
      information = 'Map(' + object.size + ')';
    }
    return information;
  }

  private getPreview(object: any): string {
    let preview: string = this.getStartChar(object);
    let count = 0;
    let keys: any;


    if (object instanceof Map) {
      keys = object.keys();
    } else {
      keys = Object.keys(object);
    }


    for (const key of keys) {
      let value: any;

      if (object instanceof Map) {
        value = object.get(key);
      } else {
        value = object[key];
      }


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

  private initObject(object: any): any {
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
}
