import {LabConfigSpecs} from '../lab-config-spec.entity';
import {LabTypeEntity} from './lab-type.entity';
import {LabIOSpec} from '../lab-io.entity';


export abstract class LabProcessType extends LabTypeEntity {

  type: LabProcessTypeDetail;

  hasDocumentation(): boolean {
    return this.type?.doc != null ?? false;
  }


  hasInputSpecs(): boolean {
    const inputSpecs: Record<string, LabIOSpec> = this.getInputSpecs();
    return inputSpecs != null && Object.keys(inputSpecs).length > 0;

  }

  hasOutputSpecs(): boolean {
    const outputSpecs: Record<string, LabIOSpec> = this.getOutputSpecs();
    return outputSpecs != null && Object.keys(outputSpecs).length > 0;
  }

  hasConfigSpecs(): boolean {
    const config: LabConfigSpecs = this.getConfigSpecs();
    return config != null && config.hasConfigs();
  }

  getConfigSpecs(): LabConfigSpecs {
    return this.type?.getConfigSpecs() ?? LabConfigSpecs.empty();
  }

  getInputSpecs(): Record<string, LabIOSpec> {
    return this.type?.getInputSpecs() ?? {};
  }

  getOutputSpecs(): Record<string, LabIOSpec> {
    return this.type?.getOutputSpecs() ?? {};
  }

}

export interface LabProcessTypeDetail {

  doc?: string;

  getInputSpecs(): Record<string, LabIOSpec>;

  getOutputSpecs(): Record<string, LabIOSpec>;

  getConfigSpecs(): LabConfigSpecs;
}
