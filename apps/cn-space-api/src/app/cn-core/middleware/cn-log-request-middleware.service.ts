import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { CnCurrentUserHelper } from '../utils/cn-current-user.helper';

/**
 * Logger to log POST, PUT, PATCH and DELETE success requests.
 * Request that end up in error are already logged by the exception handler.
 */
@Injectable()
export class CnLogRequestMiddleware implements NestMiddleware<Request, Response> {
  private readonly logger = new Logger(CnLogRequestMiddleware.name);

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, path: url } = request;
    const userAgent = request.get('user-agent') || '';

    response.on('close', () => {
      const { statusCode } = response;
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && statusCode >= 200 && statusCode < 300) {
        const userString = CnCurrentUserHelper.getCurrentUser()?.getUserInfo() ?? 'No user';
        const spaceString = CnCurrentUserHelper.getCurrentSpace()?.id ?? 'No space';
        this.logger.log(
          `${method} | ${url} | ${statusCode} | ${userString} | ${spaceString} | ${userAgent} | ${ip}`
        );
      }
    });

    next();
  }
}
