import {labGetProcessPortColor} from '../../../../lab-core/entity-module/lab-type-core/utils/lab-process-port-color';
import {LabIOSpec} from '../../../../lab-core/model/entities/lab-io.entity';

export class LabWorkflowPort {

  private static readonly INPUT_NAME_PREFIX: string = 'input_';
  private static readonly OUTPUT_NAME_PREFIX: string = 'output_';

  constructor(public name: string,
              public drawFlowName: string,
              public specs: LabIOSpec) {
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
  public isCompatible(port: LabWorkflowPort): boolean {
    // todo check what to do when null
    if (this.specs == null || port.specs == null) {
      return true;
    }

    // todo re-enable a smarter check
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
    return labGetProcessPortColor(this.specs);
  }
}
