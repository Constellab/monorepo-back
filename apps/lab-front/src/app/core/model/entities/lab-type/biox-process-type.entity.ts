import {BioxProcessData} from '../process/biox-process.entity';
import {BioxConfigSpecs} from '../biox-config-spec.entity';
import {BioxLabTypeEntity} from './biox-lab-type.entity';
import {BioxIOSpec} from '../biox-io.entity';
import {bioxTaskSourceTypingName} from '../biox-typing-name.py';


export abstract class BioxProcessType extends BioxLabTypeEntity {

  data: BioxProcessData;

  // return true if the process is a Source
  isPlugSource(): boolean {
    return this.typingName === bioxTaskSourceTypingName;
  }

  hasDocumentation(): boolean {
    return this.data.doc != null;
  }


  hasInputSpecs(): boolean {
    const inputSpecs: Record<string, BioxIOSpec[]> = this.getInputSpecs();
    return inputSpecs != null && Object.keys(inputSpecs).length > 0;

  }

  hasOutputSpecs(): boolean {
    const outputSpecs: Record<string, BioxIOSpec[]> = this.getOutputSpecs();
    return outputSpecs != null && Object.keys(outputSpecs).length > 0;

  }

  hasConfigSpecs(): boolean {
    const config: BioxConfigSpecs = this.getConfigSpecs();
    return config != null && config.hasConfigs();
  }

  abstract getInputSpecs(): Record<string, BioxIOSpec[]>;

  abstract getOutputSpecs(): Record<string, BioxIOSpec[]>;

  abstract getConfigSpecs(): BioxConfigSpecs;

}

