import {SecurityContext} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Transform} from 'class-transformer';
import {flRootInjector} from '../fl-root-injector';
import {ClTransformFnParams} from '@monorepo/core-lib';

/**
 * Transformer to sanitize string. To use on string injected in Quill
 */
export function FlSanitizeTransform(context: SecurityContext): PropertyDecorator {
  // convert date to time
  const transform = Transform(
    (params: ClTransformFnParams<string>) => flRootInjector.get(DomSanitizer).sanitize(context, params.value)
  );

  return (target: any, key: string): void => {
    transform(target, key);
  };
}
