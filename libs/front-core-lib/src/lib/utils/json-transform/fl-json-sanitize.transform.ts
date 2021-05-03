import {SecurityContext} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Transform} from 'class-transformer';
import {flRootInjector} from '../fl-root-injector';

/**
 * Transformer to sanitize string. To use on string injected in Quill
 */
export function FlSanitizeTransform(context: SecurityContext): PropertyDecorator {
  // convert date to time
  const transform = Transform(
    (param: string) => flRootInjector.get(DomSanitizer).sanitize(context, param)
  );

  return (target: any, key: string): void => {
    transform(target, key);
  };
}
