import {ObjectNode} from './fl-pretty-json.class';

/**
 * Class to construct a list of ObjectNode form a json object
 */
export class FlPrettyJsonBuilder {

  private readonly jsonObject: any;

  private id: number = 0;


  constructor(object: any, private previewMaxTextLength: number,
              private previewMaxObjectShowed: number, private maxSubObjectView: number) {
    this.jsonObject = this.initObject(object);
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

  public buildObjectNodes(): ObjectNode[] {
    return this.buildObjectNodeRecur(this.jsonObject, 0);
  }

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `ObjectNode`.
   * @param obj object to convert to ObjectNode
   * @param level level of the hierarchy
   * @param keyOffset used when object is an array to set an offset for the array index (use for big array split)
   * @private
   */
  private buildObjectNodeRecur(obj: any, level: number, keyOffset: number = 0): ObjectNode[] {
    const nodes: ObjectNode[] = [];


    // case for the array that are bigger than the maxSubObjectView
    if (Array.isArray(obj) && obj.length > this.maxSubObjectView) {
      let i = 0;
      // use to split the array in multiple section of maxSubObjectView size
      while (i < obj.length) {
        const max = Math.min(i + this.maxSubObjectView - 1, obj.length - 1);

        // define node and node properties
        const node: ObjectNode = {
          id: this.id++,
          key: `[${i}...${max}]`,
          type: 'object',
          preview: null,
          // build the sub array section
          children: this.buildObjectNodeRecur(obj.slice(i, max + 1), level + 1, i)
        };

        nodes.push(node);
        i += this.maxSubObjectView;
      }

      return nodes;
    }

    // for small arrays, or simple json object
    for (const key of Object.keys(obj)) {
      const value: any = obj[key] instanceof Map ? this.mapToJson(obj[key]) : obj[key];

      const node: ObjectNode = {
        id: this.id++,
        key: keyOffset > 0 ? (parseInt(key) + keyOffset).toString() : key,
        type: null
      };

      // set the node key, if there is an key offset, add it to the key

      if (value != null) {
        node.type = typeof value;
        if (node.type === 'object') {
          node.preview = this.getPreview(value);

          // build the sub objects
          node.children = this.buildObjectNodeRecur(value, level + 1);
        } else {
          node.value = value;
        }
      }

      nodes.push(node);
    }

    return nodes;
  }

  // get the preview text of complexe object (json object or array)
  public getPreview(object: any): string {
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

  public getObjectStartChart(): string {
    return this.getStartChar(this.jsonObject);
  }

  public getObjectEndChart(): string {
    return this.getEndChar(this.jsonObject);
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

  // convert a map to a json object
  public mapToJson(map: Map<any, any>): any {
    const object: any = {};
    map.forEach((value, key) => object[key.toString()] = value);
    return object;
  }
}
