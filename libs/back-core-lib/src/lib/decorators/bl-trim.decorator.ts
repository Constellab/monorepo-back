import { Transform } from 'class-transformer';
import { ClTransformFnParams } from '@monorepo/core-lib';

export type BlTrimOptions = 'start' | 'end' | 'both';

export function BlTrim(options: BlTrimOptions = 'both'): PropertyDecorator {
  // convert 'YYYY-MM-DD' to Date
  const transformToClass = Transform(
    (params: ClTransformFnParams<string>): string => {
      if ('string' !== typeof params.value) {
        return params.value;
      }

      switch (options) {
        case 'start':
          return params.value.trimStart();
        case 'end':
          return params.value.trimEnd();
        default:
          return params.value.trim();
      }
    },
    { toClassOnly: true }
  );

  return (target: any, key: string): void => {
    transformToClass(target, key);
  };
}
