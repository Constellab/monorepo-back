import {ContinuationLocalStorage} from 'asyncctx';
import {Request, Response} from 'express';

/**
 * Store the request context using asyncctx this class return the
 * correct context base on node thread
 */
export class BlRequestContext {
  static cls = new ContinuationLocalStorage<BlRequestContext>();

  static get currentContext(): any {
    return this.cls.getContext();
  }

  static setContext(requestContext: BlRequestContext): void {
    this.cls.setContext(requestContext);
  }


  constructor(public readonly req: Request, public readonly res: Response) {
  }
}
