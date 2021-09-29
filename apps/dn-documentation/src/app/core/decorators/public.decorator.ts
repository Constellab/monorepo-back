import {SetMetadata} from '@nestjs/common';
import {CustomDecorator} from '@nestjs/common/decorators/core/set-metadata.decorator';

export const publicMetadata = 'isPublic';

/**
 * @Public decorator for method or class to make a route public so the {@link JwtAuthGuard}
 * don't check the existence of the token
 */
export const Public = (): CustomDecorator => SetMetadata(publicMetadata, true);
