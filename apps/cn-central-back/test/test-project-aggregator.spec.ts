import { TestE2EHelper } from './test-e2e-helper.class';

describe('ProjectAggregatorE2E', () => {
  jest.setTimeout(300000);
  let helper: TestE2EHelper;
  beforeAll(async () => {
    helper = new TestE2EHelper('projects');
    await helper.initAppModule();
  });

  it(`Create project`, async () => {});

  afterAll(async () => {
    await helper.close();
  });
});
