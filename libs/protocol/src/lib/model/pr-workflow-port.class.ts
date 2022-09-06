import {TdIOSpec} from '@monorepo/technical-doc';
import {FlColorHelper} from '@monorepo/front-core-lib';

export class PrWorkflowPort {

  private static readonly INPUT_NAME_PREFIX: string = 'input_';
  private static readonly OUTPUT_NAME_PREFIX: string = 'output_';

  constructor(public name: string,
              public drawFlowName: string,
              public specs: TdIOSpec) {
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
  public isCompatible(port: PrWorkflowPort): boolean {
    if (this.specs == null || port.specs == null) {
      return true;
    }

    return true;
    // for (const type of port.types) {
    //   if (this.types.includes(type)) {
    //     return true;
    //   }
    // }
    // return false;
  }

  /**
   * return the port color base on first type
   */
  public getDefaultColor(): string {
    if (this.specs == null || this.specs.resource_types.length === 0) {
      return '#ffffff';
    } else {
      if (this.specs.resource_types[0].typing_name == null || this.specs.resource_types[0].typing_name.length === 0) {
        return '#ffffff';
      } else {
        return FlColorHelper.stringToRGBColor(this.specs.resource_types[0].typing_name);
      }
    }
  }

  public getResourceTypingNames(): string[] {
    return this.specs.resource_types.map(spec => spec.typing_name);
  }
}
