import {TestE2EHelper} from './test-e2e-helper.class';
import {CnProject} from '../src/app/cn-projects-aggregate/cn-projects/cn-project.entity';
import {ClDateHelper} from '@monorepo/core-lib';
import {TestData} from './test.data';
import {CnProjectLevel} from '../src/app/cn-projects-aggregate/cn-projects/cn-project-level.enum';
import {CnProjectStatus} from '../src/app/cn-projects-aggregate/cn-projects/cn-project-status.enum';

describe('ProjectAggregatorE2E', () => {

  jest.setTimeout(300000);
  let helper: TestE2EHelper;
  beforeAll(async () => {
    helper = new TestE2EHelper('projects');
    await helper.initAppModule();
  });

  it(`Create project`, async () => {
    helper.setToken(TestData.adminUserToken);
    const project: Partial<CnProject> = {
      code: 'TEST',
      title: 'Test project',
      description: 'Test project description',
      startingDate: ClDateHelper.getDate(),
      leafLevel: CnProjectLevel.TASK,
    }
    const request = helper.post('', project);
    request.expect(201)
    const newProject: CnProject = await request.getResponseBody();

    expect(newProject.id).toBeDefined();
    expect(newProject.code).toEqual(project.code);
    expect(newProject.title).toEqual(project.title);
    expect(newProject.description).toEqual(project.description);
    expect(newProject.level).toEqual(CnProjectLevel.PROJECT);
    expect(newProject.leafLevel).toEqual(project.leafLevel);
    expect(newProject.currentStatus.status).toEqual(CnProjectStatus.ACTIVE);
    expect(newProject.children).toBeUndefined()

    // create work package
    const workPackage: Partial<CnProject> = {
      code: 'TEST-WP',
      title: 'Test work package',
      description: 'Test work package description',
      startingDate: ClDateHelper.getDate(),
    }

    const workPackageRequest = helper.post(`${newProject.id}/work-package`, workPackage);
    workPackageRequest.expect(201)
    const newSubProject: CnProject = await workPackageRequest.getResponseBody();
    expect(newSubProject.level).toEqual(CnProjectLevel.WORK_PACKAGE);
    expect(newSubProject.rootParentId).toEqual(newProject.id);

    // create task
    const task: Partial<CnProject> = {
      code: 'TEST-TASK',
      title: 'Test task',
      description: 'Test task description',
      startingDate: ClDateHelper.getDate(),
    }

    const taskRequest = helper.post(`${newSubProject.id}/task`, task);
    taskRequest.expect(201)
    const newTask: CnProject = await taskRequest.getResponseBody();
    expect(newTask.level).toEqual(CnProjectLevel.TASK);
    expect(newTask.rootParentId).toEqual(newProject.id);


    // retrieve the project tree
    const projectTreeRequest = helper.get(`${newProject.id}/tree`);
    projectTreeRequest.expect(200)
    const projectTree: CnProject = await projectTreeRequest.getResponseBody();
    expect(projectTree.id).toEqual(newProject.id);
    expect(projectTree.children.length).toEqual(1);
    expect(projectTree.children[0].id).toEqual(newSubProject.id);
    expect(projectTree.children[0].children.length).toEqual(1);
    expect(projectTree.children[0].children[0].id).toEqual(newTask.id);
    expect(projectTree.children[0].children[0].children.length).toEqual(0);


  });

  afterAll(async () => {
    await helper.close();
  });
});
