import {Injectable, NestMiddleware} from '@nestjs/common';
import {RequestContext} from './request-context.model';
import {Request, Response} from 'express';

/**
 * This is needed to side-step Nest.js, which doesn't support getting the current execution context (i.e. Request) that's
 * not from the Controller handles directly (and passing it down explicitly). This means that things like a Logger can't
 * use DI to get the current user (if any).
 *
 * It stores the request in a store based on node thread to be able to get the request (and the user) anywhere
 *
 * This solution is taken from https://github.com/nestjs/nest/issues/699#issuecomment-405868782.
 */
@Injectable()
export class RequestContextMiddleware implements NestMiddleware<Request, Response> {
  use(req: Request, res: Response, next: () => void): void {
    // skip the options request
    if (req.method !== 'OPTIONS') {
      const requestContext = new RequestContext(req, res);
      RequestContext.setContext(requestContext);
    }

    next();
  }
}
