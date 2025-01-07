import { SetMetadata, UseGuards } from '@nestjs/common';
import { HnLabAuthGuard } from '../guards/hn-lab-auth.guard';

const hnLabAuthMetadata = 'labAuth';

export function HnLabGuard(): MethodDecorator & ClassDecorator {
  // use to combined 2 decorators
  return (target: any, property?: string | symbol, descriptor?: TypedPropertyDescriptor<any>): void => {
    // set the public metadata
    SetMetadata('isPublic', true)(target, property, descriptor);
    // set the labAuth metadata
    SetMetadata(hnLabAuthMetadata, true)(target, property, descriptor);
    // activate the CnLabAuthGuard
    UseGuards(HnLabAuthGuard)(target, property, descriptor);
  };
}
