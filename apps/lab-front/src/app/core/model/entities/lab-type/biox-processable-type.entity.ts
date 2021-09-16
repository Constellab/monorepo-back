import {BioxProcessableData} from '../proccesable/biox-processable.entity';
import {bioxTaskSourceTypingName} from '../biox-process-special-type';
import {BioxConfigSpecs} from '../biox-config-spec.entity';
import {BioxLabTypeEntity} from './biox-lab-type.entity';


export abstract class BioxProcessableType extends BioxLabTypeEntity {

  data: BioxProcessableData;

  // return true if the process is a Source
  isPlugSource(): boolean {
    return this.typingName === bioxTaskSourceTypingName;
  }

  hasDocumentation(): boolean {
    return this.data.doc != null;
  }


  hasInputSpecs(): boolean {
    const inputSpecs: Record<string, string[]> = this.getInputSpecs();
    return inputSpecs != null && Object.keys(inputSpecs).length > 0;

  }

  hasOutputSpecs(): boolean {
    const outputSpecs: Record<string, string[]> = this.getOutputSpecs();
    return outputSpecs != null && Object.keys(outputSpecs).length > 0;

  }

  hasConfigSpecs(): boolean {
    const config: BioxConfigSpecs = this.getConfigSpecs();
    return config != null && config.hasConfigs();
  }

  abstract getInputSpecs(): Record<string, string[]>;

  abstract getOutputSpecs(): Record<string, string[]>;

  abstract getConfigSpecs(): BioxConfigSpecs;

}

