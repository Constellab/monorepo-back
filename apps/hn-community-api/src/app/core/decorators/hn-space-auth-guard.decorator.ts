import { SetMetadata, UseGuards } from '@nestjs/common';

import { HnSpaceAuthGuard } from '../guards/hn-space-auth.guard';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function HnSpaceGuard(): MethodDecorator & ClassDecorator {
  return (target: any, property?: string | symbol, descriptor?: TypedPropertyDescriptor<any>): void => {
    SetMetadata('isPublic', true)(target, property, descriptor);
    UseGuards(HnSpaceAuthGuard)(target, property, descriptor);
  };
}
