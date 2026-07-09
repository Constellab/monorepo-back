import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as supertest from 'supertest';
import { Agent } from 'supertest';

import { HnCoreConfigService } from '../src/app/core/modules/core-config/hn-core-config.service';
import { HnAppModule } from '../src/hn-app.module';
import { HnTestDbInitializerService } from './hn-test.module';
import { TestConfigService } from './test-config.service';
import { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD } from './test-credentials';
import { TestGetOptions, TestIdOptions } from './test-e2e-helper.config';
import { TestRequest } from './test-request.class';

export class HnTestE2EHelper {
  public app!: INestApplication;

  private token?: string;

  constructor(private routeBase: string) {}

  ///////////////////////////// INITIALIZATION /////////////////////////////

  /**
   * Call this method in the beforeAll method in a test to init the nest app.
   */
  public async initAppModule(): Promise<INestApplication> {
    const moduleRef = await Test.createTestingModule({
      imports: [HnAppModule],
      providers: [HnTestDbInitializerService],
    })
      // override the config service to set the test database and test profile
      .overrideProvider(HnCoreConfigService)
      .useClass(TestConfigService)
      .compile();
    this.app = moduleRef.createNestApplication();

    // Reset + seed the database BEFORE app.init(): some services query the DB in
    // their onModuleInit lifecycle hook, which app.init() triggers — so the
    // schema must exist first.
    const dbInitializer = moduleRef.get(HnTestDbInitializerService);
    await dbInitializer.initDb();

    await this.app.init();

    return this.app;
  }

  ///////////////////////////// AUTHENTICATION /////////////////////////////

  /**
   * Log in as the seeded admin user and store the token so every subsequent
   * request is authenticated. Exercises the real POST /auth/login endpoint and
   * reads the JWT back from the httpOnly `Authorization` cookie.
   */
  public async loginAsAdmin(): Promise<void> {
    await this.login(TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD);
  }

  /**
   * Log in with the given credentials against POST /auth/login and store the
   * returned token for subsequent requests.
   */
  public async login(email: string, password: string): Promise<void> {
    // POST returns 201 (NestJS default for POST handlers)
    const response = await supertest(this.app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201);

    const token = this.extractTokenFromSetCookie(response);
    if (!token) {
      throw new Error('Login succeeded but no Authorization cookie was returned');
    }
    this.setToken(token);
  }

  /**
   * Extract the Authorization token from the Set-Cookie response header.
   */
  private extractTokenFromSetCookie(response: supertest.Response): string | undefined {
    const rawCookies = response.headers['set-cookie'];
    if (!rawCookies) {
      return undefined;
    }
    const cookies: string[] = Array.isArray(rawCookies) ? rawCookies : [rawCookies];
    const authCookie = cookies.find((cookie) => cookie.startsWith('Authorization='));
    if (!authCookie) {
      return undefined;
    }
    // cookie format: "Authorization=<token>; Path=/; ..."
    return authCookie.split(';')[0].substring('Authorization='.length);
  }

  ///////////////////////////// REQUESTS /////////////////////////////

  /**
   * Generate a test request for an HTTP POST and test status is 200
   */
  public testPost(route: string, body: any): TestRequest {
    return this.post(route, body).expect(200);
  }

  /**
   * Generate a test request for an HTTP POST
   */
  public post(route: string, body: any): TestRequest {
    return this.buildTestRequest(this.getSuperTest().post(this.constructRoute(route)).send(body));
  }

  /**
   * Generate a test request for an HTTP PUT and test status is 200
   */
  public testPut(route: string, body: any): TestRequest {
    return this.put(route, body).expect(200);
  }

  /**
   * Generate a test request for an HTTP PUT
   */
  public put(route: string, body: any): TestRequest {
    return this.buildTestRequest(this.getSuperTest().put(this.constructRoute(route)).send(body));
  }

  /**
   * Generate a test request for an HTTP DELETE and test status is 200
   */
  public testDelete(route: string, options?: TestIdOptions): TestRequest {
    return this.delete(route, options).expect(200);
  }

  /**
   * Generate a test request for an HTTP DELETE
   */
  public delete(route: string, options?: TestIdOptions): TestRequest {
    return this.buildTestRequest(this.getSuperTest().delete(this.constructRoute(route, options)));
  }

  /**
   * Generate a test request for an HTTP GET and test status is 200
   */
  public testGet(route: string, options?: TestGetOptions): TestRequest {
    return this.get(route, options).expect(200);
  }

  /**
   * Generate a test request for an HTTP GET
   */
  public get(route: string, options?: TestGetOptions): TestRequest {
    return this.buildTestRequest(this.getSuperTest().get(this.constructGetRoute(route, options)));
  }

  private getSuperTest(): Agent {
    return supertest(this.app.getHttpServer());
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
   * Construct the get route with pagination
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
   * Function to call in the afterAll method to close the nest app after the tests
   */
  public async close(): Promise<void> {
    await this.app.close();
  }

  ///////////////////////////// OTHER /////////////////////////////

  /**
   * Set the token for all the requests
   */
  public setToken(token: string): void {
    this.token = token;
  }
}
