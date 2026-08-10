import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { BlRequestContext } from './bl-request-context';

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
    if (req.method === 'OPTIONS') {
      next();
      return;
    }

    const requestContext = new BlRequestContext(req, res, null, {});
    // the rest of the chain runs inside the context, so it stays available in the
    // async continuations too (guards, handlers, exception filters)
    BlRequestContext.runWithContext(requestContext, next);
  }
}
