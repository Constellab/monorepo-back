import {LabConfigureSpecsForm, LabConfigValues} from '../entities/lab-config.entity';
import {LabProcessType} from '../entities/lab-type/lab-process-type.entity';

export interface LabCallTransformerParams {
  typing_name: string;
  config_values: LabConfigValues;
}

export interface LabTransformForm {
  transformer: LabProcessType;
  config: LabConfigureSpecsForm;
}

export interface LabTransformerWithConfig {
  transformer: LabProcessType;
  config: LabConfigValues;
}

export function labConvertTransformFormToParams(formValue: LabTransformForm[]): LabCallTransformerParams[] {
  const transformers: LabCallTransformerParams[] = [];
  for (const form of formValue) {
    transformers.push({
      typing_name: form.transformer.typingName,
      config_values: {...form.config.public, ...form.config.protected}
    });
  }
  return transformers;
}

export function labConvertTransformersWithConfigToParams(transformers: LabTransformerWithConfig[]): LabCallTransformerParams[] {
  return transformers.map(transformer => ({
    typing_name: transformer.transformer.typingName,
    config_values: transformer.config
  }));
}
