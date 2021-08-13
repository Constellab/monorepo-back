import {LabBaseEntity} from '../../global/lab-entity.entity';
import {Expose} from 'class-transformer';
import {BioxProcessableData} from '../proccesable/biox-processable.entity';
import {bioxProcessSourceTypingName} from '../biox-process-special-type';
import {BioxConfigSpecs} from '../biox-config-spec.entity';


export abstract class BioxProcessableType extends LabBaseEntity {

  @Expose({name: 'typing_name'})
  typingName: string;

  @Expose({name: 'model_name'})
  modelName: string;

  @Expose({name: 'human_name'})
  humanName?: string;

  @Expose({name: 'short_description'})
  shortDescription?: string;

  data: BioxProcessableData;

  hasDocumentation(): boolean {
    return this.data.doc != null;
  }

  // return true if the process is a Source
  isPlugSource(): boolean {
    return this.typingName === bioxProcessSourceTypingName;
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

  get name(): string{
    return this.humanName || this.modelName;
  }

  abstract getInputSpecs(): Record<string, string[]>;

  abstract getOutputSpecs(): Record<string, string[]>;

  abstract getConfigSpecs(): BioxConfigSpecs;

}

