export class ClBulkActionError {
  id: string;
  name: string;
  message: string;
}

export class ClBulkActionResult {
  total: number;
  successCount: number;
  errorCount: number;
  errors: ClBulkActionError[];
}

export class ClBulkActionRunner {
  private ids: string[];
  private action: (id: string) => Promise<void>;
  private nameResolver: (id: string) => Promise<string>;

  constructor(ids: string[]) {
    this.ids = ids;
  }

  setAction(action: (id: string) => Promise<void>): this {
    this.action = action;
    return this;
  }

  setNameResolver(nameResolver: (id: string) => Promise<string>): this {
    this.nameResolver = nameResolver;
    return this;
  }

  async execute(): Promise<ClBulkActionResult> {
    if (!this.action) {
      throw new Error('ClBulkActionRunner: action is not set. Call setAction() before execute().');
    }
    if (!this.nameResolver) {
      this.nameResolver = (id: string) => Promise.resolve(id);
    }

    const result: ClBulkActionResult = {
      total: this.ids.length,
      successCount: 0,
      errorCount: 0,
      errors: [],
    };
    for (const id of this.ids) {
      try {
        await this.action(id);
        result.successCount++;
      } catch (error: unknown) {
        result.errorCount++;
        const name = await this.nameResolver(id).catch(() => id);
        result.errors.push({
          id,
          name,
          message: ClBulkActionRunner.resolveErrorMessage(error),
        });
      }
    }

    return result;
  }

  private static isHttpException(error: unknown): error is { message: string; getStatus: () => number } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as any).message === 'string' &&
      'getStatus' in error &&
      typeof (error as any).getStatus === 'function'
    );
  }

  private static resolveErrorMessage(error: unknown): string {
    if (ClBulkActionRunner.isHttpException(error)) {
      return error.message;
    }
    return 'Internal Server Error';
  }
}
