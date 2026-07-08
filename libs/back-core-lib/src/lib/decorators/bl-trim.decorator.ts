import { ClTransformFnParams } from '@monorepo/core-lib';
import { Transform } from 'class-transformer';

export type BlTrimOptions = 'start' | 'end' | 'both';

// eslint-disable-next-line @typescript-eslint/naming-convention
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

  return (target: any, key: string | symbol): void => {
    transformToClass(target, key);
  };
}
