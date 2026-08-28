import { AsyncLocalStorage } from 'async_hooks';
import { Request, Response } from 'express';

/**
 * Store the request context using asyncctx this class return the
 * correct context base on node thread
 */
export class BlRequestContext {
  static cls = new AsyncLocalStorage<BlRequestContext>();

  static get currentContext(): BlRequestContext | undefined {
    return this.cls.getStore();
  }

  /**
   * Run `callback` (and everything it awaits downstream) with `requestContext` as the
   * current context.
   *
   * `run` rather than `enterWith`: the store set by `enterWith` can be lost when the
   * chain resumes inside an async continuation (Bun's async_hooks propagation is weaker
   * there), which leaves `currentContext` undefined for the rest of the request.
   */
  static runWithContext(requestContext: BlRequestContext, callback: () => void): void {
    this.cls.run(requestContext, callback);
  }

  constructor(
    public readonly req: Request,
    public readonly res: Response,
    public authContext: any,
    public additionalData: Record<string, any> = {}
  ) {}
}
