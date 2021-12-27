import {LabProcessData} from '../process/lab-process.entity';
import {LabConfigSpecs} from '../lab-config-spec.entity';
import {LabTypeEntity} from './lab-type.entity';
import {LabIOSpec} from '../lab-io.entity';
import {LabTypingName} from '../lab-typing-name.class';


export abstract class LabProcessType extends LabTypeEntity {

  data: LabProcessData;

  // return true if the process is a Source
  isPlugSource(): boolean {
    return this.typingName === LabTypingName.task.source;
  }

  hasDocumentation(): boolean {
    return this.data.doc != null;
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

  abstract getInputSpecs(): Record<string, LabIOSpec>;

  abstract getOutputSpecs(): Record<string, LabIOSpec>;

  abstract getConfigSpecs(): LabConfigSpecs;

}

