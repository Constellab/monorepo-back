import {BioxConfigValues} from '../entities/biox-config.entity';
import {BioxProcessType} from '../entities/lab-type/biox-process-type.entity';

export interface CallTransformerParams {
  typing_name: string;
  config_values: BioxConfigValues;
}

export interface BioxTransformForm {
  transformer: BioxProcessType;
  public: BioxConfigValues;
  protected: BioxConfigValues;
}

export interface BioxTransformerWithConfig {
  transformer: BioxProcessType;
  config: BioxConfigValues;
}

export function convertTransformFormToParams(formValue: BioxTransformForm[]): CallTransformerParams[] {
  const transformers: CallTransformerParams[] = [];
  for (const form of formValue) {
    transformers.push({
      typing_name: form.transformer.typingName,
      config_values: {...form.public, ...form.protected}
    });
  }
  return transformers;
}
