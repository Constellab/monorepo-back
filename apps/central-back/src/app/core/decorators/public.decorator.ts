import {SetMetadata} from '@nestjs/common';

export const publicMetadata = 'isPublic';

/**
 * @Public decorator for method or class to make a route public so the {@link JwtAuthGuard}
 * don't check the existence of the token
 */
export const Public = () => SetMetadata(publicMetadata, true);
