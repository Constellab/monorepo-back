import { CallbackHandler, Response, Test } from 'supertest';

/**
 * Facade for the SuperTest Test.
 * Contains methods to configure a request and test its result.
 */
export class TestRequest {
  constructor(private readonly superTest: Test) {}

  /**
   * Facade for the expect method of SuperTest
   */
  expect(status: number, callback?: CallbackHandler): this;
  expect(status: number, body: any, callback?: CallbackHandler): this;
  // tslint:disable-next-line:unified-signatures
  expect(checker: (res: Response) => any, callback?: CallbackHandler): this;
  // tslint:disable-next-line:unified-signatures
  expect(body: any, callback?: CallbackHandler): this;
  expect(field: string, val: string | RegExp, callback?: CallbackHandler): this;
  public expect(value1: any, value2?: any, value3?: any): this {
    // we need to call the method with the right number of parameters otherwise
    //  it doesn't work correctly
    if (value2 === undefined) {
      this.superTest.expect(value1);
    } else if (value3 === undefined) {
      this.superTest.expect(value1, value2);
    } else {
      this.superTest.expect(value1, value2, value3);
    }
    return this;
  }

  /**
   * Set the token in the request
   */
  public setTokenInCookie(token: string): this {
    this.superTest.set('Cookie', [`Authorization=${token}`]);
    return this;
  }

  /**
   * Must call this method in the end of the test to return a promise
   */
  public getResponse(): Promise<Response> {
    return this.superTest;
  }

  public async getResponseBody(): Promise<any> {
    return (await this.superTest).body;
  }
}
