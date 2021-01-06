import {ContinuationLocalStorage} from 'asyncctx';
import {Request, Response} from 'express';

/**
 * Store the request context using asyncctx this class return the
 * correct context base on node thread
 */
export class RequestContext {
  static cls = new ContinuationLocalStorage<RequestContext>();

  static get currentContext(): any {
    return this.cls.getContext();
  }

  readonly requestId: number;

  static setContext(requestContext: RequestContext): void {
    this.cls.setContext(requestContext);
  }


  constructor(public readonly req: Request, public readonly res: Response) {
    this.requestId = Date.now();
  }
}
