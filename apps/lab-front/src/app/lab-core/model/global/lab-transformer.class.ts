import {LabConfigureSpecsForm} from '../entities/lab-config.entity';
import {LabProcessType} from '../entities/lab-type/lab-process-type.entity';
import {RvTransformerParams} from '@monorepo/resource-view';
import {PrConfigValues} from '@monorepo/protocol';


export interface LabTransformForm {
  transformer: LabProcessType;
  config: LabConfigureSpecsForm;
}

export interface LabTransformerWithConfig {
  transformer: LabProcessType;
  config: PrConfigValues;
}

export function labConvertTransformFormToParams(formValue: LabTransformForm[]): RvTransformerParams[] {
  const transformers: RvTransformerParams[] = [];
  for (const form of formValue) {
    transformers.push({
      typing_name: form.transformer.typingName,
      config_values: {...form.config.public, ...form.config.protected}
    });
  }
  return transformers;
}

export function labConvertTransformersWithConfigToParams(transformers: LabTransformerWithConfig[]): RvTransformerParams[] {
  return transformers.map(transformer => ({
    typing_name: transformer.transformer.typingName,
    config_values: transformer.config
  }));
}
