import { CustomDecorator, SetMetadata } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const IsAdmin = (): CustomDecorator => SetMetadata('isAdmin', true);
