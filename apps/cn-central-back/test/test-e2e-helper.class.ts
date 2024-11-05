import { CnAppModule } from '../src/cn-app.module';
import { CnCoreConfigService } from '../src/app/cn-core/modules/cn-core-config/cn-core-config.service';
import { TestConfigService } from './test-config.service';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import supertest, { SuperTest } from 'supertest';
import { Test } from '@nestjs/testing';
import { TestRequest } from './test-request.class';
import { TestGetOptions, TestIdOptions } from './test-e2e-helper.config';
import { CnTestDbInitializerService } from './cn-test.module';

export class TestE2EHelper {
  public app: INestApplication;

  private token?: string;

  constructor(private routeBase: string) {}

  ///////////////////////////// INITIALIZATION /////////////////////////////

  /**
   * Call this method in the beforeAll method in test to init
   * the nest app
   */
  public async initAppModule(): Promise<INestApplication> {
    const moduleRef = await Test.createTestingModule({
      imports: [CnAppModule],
      providers: [CnTestDbInitializerService],
    })
      // override the config service to set the test database and test profile
      .overrideProvider(CnCoreConfigService)
      .useClass(TestConfigService)
      .compile();
    this.app = moduleRef.createNestApplication();
    await this.app.init();

    // clean the database
    const dbInitializer = moduleRef.get(CnTestDbInitializerService);
    await dbInitializer.initDb();

    return this.app;
  }

  ///////////////////////////// REQUESTS /////////////////////////////

  /**
   * Generate a test request for an HTTP POST and test status is 200
   * @param route route to call
   * @param body
   */
  public testPost(route: string, body: any): TestRequest {
    return this.post(route, body).expect(200);
  }

  /**
   * Generate a test request for an HTTP POST
   * @param route route to call
   * @param body
   */
  public post(route: string, body: any): TestRequest {
    return this.buildTestRequest(this.getSuperTest().post(this.constructRoute(route)).send(body));
  }

  /**
   * Generate a test request for an HTTP PUT and test status is 200
   * @param route route to call
   * @param body
   */
  public testPut(route: string, body: any): TestRequest {
    return this.put(route, body).expect(200);
  }

  /**
   * Generate a test request for an HTTP PUT
   * @param route route to call
   * @param body
   */
  public put(route: string, body: any): TestRequest {
    return this.buildTestRequest(this.getSuperTest().put(this.constructRoute(route)).send(body));
  }

  /**
   * Generate a test request for an HTTP DELETE and test status is 200
   * @param route route to call
   * @param options
   */
  public testDelete(route: string, options?: TestIdOptions): TestRequest {
    return this.delete(route, options).expect(200);
  }

  /**
   * Generate a test request for an HTTP DELETE
   * @param route route to call
   * @param options
   */
  public delete(route: string, options?: TestIdOptions): TestRequest {
    return this.buildTestRequest(this.getSuperTest().delete(this.constructRoute(route, options)));
  }

  /**
   * Generate a test request for an HTTP GET and test status is 200
   * @param route route to call
   * @param options option for the get
   */
  public testGet(route: string, options?: TestGetOptions): TestRequest {
    return this.get(route, options).expect(200);
  }

  /**
   * Generate a test request for an HTTP GET
   * @param route route to call
   * @param options option for the get
   */
  public get(route: string, options?: TestGetOptions): TestRequest {
    return this.buildTestRequest(this.getSuperTest().get(this.constructGetRoute(route, options)));
  }

  private getSuperTest(): SuperTest<supertest.Test> {
    return request(this.app.getHttpServer());
  }

  private buildTestRequest(superTest: supertest.Test): TestRequest {
    const testRequest = new TestRequest(superTest);
    if (this.token) {
      testRequest.setTokenInCookie(this.token);
    }
    return testRequest;
  }

  ///////////////////////////// INTERNAL /////////////////////////////

  /**
   * Construct the get routes with pagination
   * @private
   */
  private constructGetRoute(route: string, options?: TestGetOptions): string {
    let fullRoute: string = this.constructRoute(route, options);

    // manage the pagination
    if (options?.page != null || options?.pageSize != null) {
      let firstCharacter: string;

      // check if there are already some url parameters
      if (route.search('\\?') !== -1) {
        firstCharacter = '&';
      } else {
        firstCharacter = '?';
      }

      // add the page parameter
      if (options.page != null) {
        fullRoute += `${firstCharacter}page=${options.page}`;
        firstCharacter = '&';
      }
      // add the size parameter
      if (options.pageSize != null) {
        fullRoute += `${firstCharacter}size=${options.pageSize}`;
      }
    }

    return fullRoute;
  }

  /**
   * Construct the route with the base route
   * @private
   */
  private constructRoute(route: string, options?: TestIdOptions): string {
    let fullRoute: string;
    if (this.routeBase) {
      fullRoute = `/${this.routeBase}/${route}`;
    } else {
      fullRoute = `/${route}`;
    }

    if (options?.id) {
      fullRoute += `/${options.id}`;
    }

    return fullRoute;
  }

  ///////////////////////////// CLOSE /////////////////////////////

  /**
   * Function to call in afterAll method to class the nest app after the tests
   */
  public async close(): Promise<void> {
    await this.app.close();
  }

  ///////////////////////////// OTHER /////////////////////////////

  /**
   * Set the token to all the requests
   * @param token
   */
  public setToken(token: string): void {
    this.token = token;
  }
}
