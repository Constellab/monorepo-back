import { Request, Response } from 'express';
import { AsyncLocalStorage } from 'async_hooks';

/**
 * Store the request context using asyncctx this class return the
 * correct context base on node thread
 */
export class BlRequestContext {
  static cls = new AsyncLocalStorage<BlRequestContext>();

  static get currentContext(): BlRequestContext {
    return this.cls.getStore();
  }

  static setContext(requestContext: BlRequestContext): void {
    this.cls.enterWith(requestContext);
  }

  constructor(
    public readonly req: Request,
    public readonly res: Response,
    public authContext: any,
    public additionalData: Record<string, any> = {}
  ) {}
}
