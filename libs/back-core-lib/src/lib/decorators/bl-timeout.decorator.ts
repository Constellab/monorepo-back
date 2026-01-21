import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { BL_TIMEOUT_KEY, BlTimeoutOptions } from '../interceptors/bl-timeout.interceptor';

/**
 * Decorator to set a custom timeout for a specific route.
 * @param ms Timeout in milliseconds
 * @param message Optional custom error message to display when timeout occurs
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const BlTimeout = (ms: number, message?: string): CustomDecorator =>
  SetMetadata(BL_TIMEOUT_KEY, { ms, message } as BlTimeoutOptions);
