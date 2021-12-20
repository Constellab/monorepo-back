import {TestE2EHelper} from '../../../test/test-e2e-helper.class';
import {TestData} from '../../../test/test.data';


describe('Projects', () => {
  jest.setTimeout(30000);
  const testHelper: TestE2EHelper = new TestE2EHelper('projects');

  beforeAll(async () => {
    await testHelper.initAppModule();
  });

  it(`/GET projects paginated`, () => {
    return testHelper.testGet('current', {page: 0, pageSize: 20})
      .setTokenInCookie(TestData.adminUserToken)
      .getPromise();
  });

  it(`/POST projects`, () => {
    return testHelper.post('', TestData.newProject)
      .setTokenInCookie(TestData.adminUserToken)
      .getPromise();
  });

  afterAll(async () => {
    await testHelper.close();
  });
});
