import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';

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

  @Input() object: any;

  startChar: string;
  endChar: string;

  treeControl: FlatTreeControl<ObjectFlatNode>;

  treeFlattener: MatTreeFlattener<ObjectNode, ObjectFlatNode>;

  dataSource: MatTreeFlatDataSource<ObjectNode, ObjectFlatNode>;

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

    if (this.object == null) {
      this.startChar = 'null';
      return;
    }

    this.startChar = this.getStartChar(this.object);
    this.endChar = this.getEndChar(this.object);

    this.initialize();
  }

  initialize(): void {
    const data = this.buildFileTree(this.object, 0);

    this.treeControl = new FlatTreeControl<ObjectFlatNode>(
      node => node.level, node => node.expandable);

    // object to flatten tree
    this.treeFlattener = new MatTreeFlattener(
      this._transformer, node => node.level, node => node.expandable, node => node.children);

    // create the datasource and set data
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.dataSource.data = data;
  }

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `ObjectNode`.
   */
  buildFileTree(obj: { [key: string]: any }, level: number): ObjectNode[] {

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

      if (count < 3) {

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

    if (preview.length > 100) {
      preview = preview.substr(0, 100) + '...';
    }

    preview += this.getEndChar(object);

    return preview;
  }

  private getStartChar(object: any): string {
    if (Array.isArray(object)) {
      return '[';
    } else if (typeof object === 'object') {
      return '{';
    } else {
      console.error('Wrong object ', object);
      return '';
    }
  }

  private getEndChar(object: any): string {
    if (Array.isArray(object)) {
      return ']';
    } else if (typeof object === 'object') {
      return '}';
    } else {
      console.error('Wrong object ', object);
      return '';
    }
  }

}
