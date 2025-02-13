import { Injectable, NestMiddleware } from '@nestjs/common';
import { BlRequestContext } from './bl-request-context';
import { NextFunction, Request, Response } from 'express';

/**
 * This is needed to side-step Nest.js, which doesn't support getting
 * the current execution context (i.e. Request) that's
 * not from the Controller handles directly (and passing it down explicitly).
 * This means that things like a Logger can't use DI to get the current user (if any).
 *
 * It stores the request in a store based on node thread to be able to get the request (and the user) anywhere
 *
 * This solution is taken from https://github.com/nestjs/nest/issues/699#issuecomment-405868782.
 */
@Injectable()
export class BlRequestContextMiddleware implements NestMiddleware<Request, Response> {
  use(req: Request, res: Response, next: NextFunction): void {
    // skip the options request
    if (req.method !== 'OPTIONS') {
      const requestContext = new BlRequestContext(req, res, null, {});
      BlRequestContext.setContext(requestContext);
    }

    next();
  }
}
