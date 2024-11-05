import { SetMetadata } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const IsAdmin = () => SetMetadata('isAdmin', true);
