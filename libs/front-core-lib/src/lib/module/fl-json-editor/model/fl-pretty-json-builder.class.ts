import {FlObjectNode, FlObjectNodeType} from './fl-pretty-json.class';

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

  public buildObjectNodes(): FlObjectNode[] {
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
  private buildObjectNodeRecur(obj: any, level: number, keyOffset: number = 0): FlObjectNode[] {
    const keys: string[] = Object.keys(obj);
    // case for the object or array that are bigger than the maxSubObjectView
    if (keys.length > this.maxSubObjectView) {
      return this.buildBigObjects(obj, level);
    } else {
      return this.buildSmallObjects(obj, level, keyOffset);
    }
  }

  /**
   * For build recur, it split the big object or array into small sub objects groups
   */
  private buildBigObjects(obj: any, level: number): FlObjectNode[] {
    const nodes: FlObjectNode[] = [];

    const keys: string[] = Object.keys(obj);
    let i = 0;

    const startChar: string = this.getStartChar(obj);
    const endChar: string = this.getEndChar(obj);
    // use to split the array in multiple section of maxSubObjectView size
    while (i < keys.length) {
      const max = Math.min(i + this.maxSubObjectView - 1, keys.length - 1);

      // split the object or array into a small part
      const subObject: any = this.getAnyPart(obj, i, max + 1);

      // calculate offset only for big array not for big object
      const offset: number = Array.isArray(obj) ? i : 0;

      // define node and node properties
      const node: FlObjectNode = {
        id: this.id++,
        key: `${startChar}${i}...${max}${endChar}`,
        type: 'object',
        preview: null,
        // build the sub array section
        children: this.buildObjectNodeRecur(subObject, level + 1, offset)
      };

      nodes.push(node);
      i += this.maxSubObjectView;
    }

    return nodes;

  }

  /**
   * For build recur, build the objects
   */
  private buildSmallObjects(obj: any, level: number, keyOffset: number = 0): FlObjectNode[] {
    const nodes: FlObjectNode[] = [];

    // for small arrays, or simple json object
    for (const key of Object.keys(obj)) {
      const value: any = obj[key] instanceof Map ? this.mapToJson(obj[key]) : obj[key];

      const node: FlObjectNode = {
        id: this.id++,
        // set the node key, if there is an key offset, add it to the key
        key: keyOffset > 0 ? (parseInt(key) + keyOffset).toString() : key,
        type: null
      };


      node.type = this.getType(value);
      if (value != null) {
        // for object that contains at least one element
        if (node.type === 'object' && Object.keys(value).length > 0) {
          node.preview = this.getPreview(value);

          // build the sub objects
          node.children = this.buildObjectNodeRecur(value, level + 1);
        } else {
          // case for the empty object and array
          if (node.type === 'object') {
            node.value = value instanceof Array ? '[ ]' : '{ }';
          } else {
            node.value = value;
          }
        }
      } else {
        node.value = 'null';
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

  private getType(object: any): FlObjectNodeType {
    if (object == null) {
      return 'null';
    }

    switch (typeof object) {
      case 'boolean':
        return 'boolean';
      case 'bigint':
      case 'number':
        return 'number';
      case 'object':
        return 'object';
      default:
        return 'string';
    }
  }

  // retrieve part of an object or array
  private getAnyPart(object: any, from: number, to: number): any {
    if (Array.isArray(object)) {
      return this.getArrayPart(object, from, to);
    } else {
      return this.getObjectPart(object, from, to);
    }
  }

  // retrieve part of an object
  private getObjectPart(object: any, from: number, to: number): any {
    const subObject: any = {};
    const keys: string[] = Object.keys(object);
    for (let i = from; i < to; i++) {
      subObject[keys[i]] = object[keys[i]];
    }
    return subObject;
  }

  // retrieve part of an array
  private getArrayPart(object: any[], from: number, to: number): any[] {
    return object.slice(from, to);
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
