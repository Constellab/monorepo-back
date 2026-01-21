import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { BL_TIMEOUT_KEY } from '../interceptors/bl-timeout.interceptor';

/**
 * Decorator to set a custom timeout for a specific route.
 * @param ms Timeout in milliseconds
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const BlTimeout = (ms: number): CustomDecorator => SetMetadata(BL_TIMEOUT_KEY, ms);
