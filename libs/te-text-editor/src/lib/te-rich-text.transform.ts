import { ClTransformFnParams } from '@monorepo/core-lib';
import { Transform } from 'class-transformer';

import { TeRichText, TeRichTextInput } from './te-rich-text.class';

/**
 * Transform decorator for TeRichText
 * Deserialization --> create TeRichText from TeRichTextInput
 * Serialization --> create TeRichTextInput from TeRichText
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function TeRichTextTransform(): PropertyDecorator {
  // convert dateTime to ISI
  const transformToPlain = Transform(
    (params: ClTransformFnParams<TeRichText>): TeRichTextInput => {
      if (params.value == null) return null;
      return params.value.toJson();
    },
    { toPlainOnly: true }
  );

  // convert ISO to DateTime
  const transformToClass = Transform(
    (params: ClTransformFnParams<TeRichTextInput>): TeRichText => new TeRichText(params.value),
    { toClassOnly: true }
  );

  return (target: any, key: string): void => {
    transformToPlain(target, key);
    transformToClass(target, key);
  };
}
