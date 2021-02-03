import {FlColorHelper} from '@monorepo/front-core-lib';

export class WorkflowPort {

  private static readonly INPUT_NAME_PREFIX: string = 'input_';
  private static readonly OUTPUT_NAME_PREFIX: string = 'output_';

  constructor(public name: string,
              public drawFlowName: string,
              public type: string[]) {
  }

  /**
   * get the input drawflow name based on port index
   * @param index
   */
  public static getInputDrawflowName(index: string | number): string {
    return this.INPUT_NAME_PREFIX + index.toString();
  }

  /**
   * get the output drawflow name based on port index
   * @param index
   */
  public static getOutputDrawflowName(index: string | number): string {
    return this.OUTPUT_NAME_PREFIX + index.toString();
  }

  /**
   * return true if this port is compatible with the input port
   * If both port have at least on common type
   * If one is null, it is compatible with anything
   */
  public isCompatible(port: WorkflowPort): boolean {
    // todo check what to do when null
    if(this.type == null || port.type == null){
      return true;
    }

    for (const type of port.type) {
      if (this.type.includes(type)) {
        return true;
      }
    }
    return false;
  }

  /**
   * return the port color base on type
   */
  public getColor(): string {
    if (this.type == null) {
      return '#ffffff';
    } else {
      return FlColorHelper.stringToRGBColor(this.type.join(''));
    }
  }
}
