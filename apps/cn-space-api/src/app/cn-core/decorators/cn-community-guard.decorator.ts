import { SetMetadata, UseGuards } from '@nestjs/common';

import { CnCommunityAuthGuard } from '../guards/cn-community-auth.guard';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function CnCommunityGuard(): MethodDecorator & ClassDecorator {
  return (target: any, property?: string | symbol, descriptor?: TypedPropertyDescriptor<any>): void => {
    SetMetadata('isPublic', true)(target, property, descriptor);
    UseGuards(CnCommunityAuthGuard)(target, property, descriptor);
  };
}
