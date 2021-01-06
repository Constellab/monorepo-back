import {SetMetadata, UseGuards} from '@nestjs/common';
import {LabAuthGuard} from '../guards/lab-auth.gaurd';

export const labAuthMetadata = 'labAuth';

/**
 * @LabGuard decorator for method or class to make a route authenticated with
 * the lab token. It is used for routes called by the lab servers.
 *
 * The {@link LabAuthGuard} check this decorator
 */
export function LabGuard(): MethodDecorator & ClassDecorator {
  // use to combined 2 decorators
  return (target: any, property?: string | symbol, descriptor?: TypedPropertyDescriptor<any>): void => {
    // set the labAuth metadata
    SetMetadata(labAuthMetadata, true)(target, property, descriptor);
    // activate the LabAuthGuard
    UseGuards(LabAuthGuard)(target, property, descriptor);
  };
}
