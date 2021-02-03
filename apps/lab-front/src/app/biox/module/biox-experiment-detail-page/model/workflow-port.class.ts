import {FlColorHelper} from '@monorepo/front-core-lib';

export class WorkflowPort{

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
   * return the port color base on type
   */
  public getColor(): string{
    if(this.type == null){
      return '#ffffff'
    }
    else{
      return FlColorHelper.stringToRGBColor(this.type.join(''));
    }
  }
}
