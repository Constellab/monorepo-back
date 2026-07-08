import { ClTransformFnParams } from '@monorepo/core-lib';
import { Transform } from 'class-transformer';

/**
 * Transform the value to lower case when the object is created
 * from a plain object (using plainToClass / BlParsePipe).
 * Useful to normalize values like emails so comparisons and
 * lookups are case-insensitive.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function BlLowerCase(): PropertyDecorator {
  const transformToClass = Transform(
    (params: ClTransformFnParams<string>): string => {
      if ('string' !== typeof params.value) {
        return params.value;
      }

      return params.value.toLowerCase();
    },
    { toClassOnly: true }
  );

  return (target: any, key: string | symbol): void => {
    transformToClass(target, key);
  };
}
