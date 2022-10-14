import {TestE2EHelper} from './test-e2e-helper.class';
import {CnProject} from '../src/app/cn-projects-aggregate/cn-projects/cn-project.entity';
import {ClDateHelper} from '@monorepo/core-lib';
import {TestData} from './test.data';
import {CnProjectLevel, CnProjectLevelStatus} from '../src/app/cn-projects-aggregate/cn-projects/cn-project-level.enum';
import {CnProjectStatus} from '../src/app/cn-projects-aggregate/cn-projects/cn-project-status.enum';
import {CnProjectAncestorTreeDTO} from '../src/app/cn-projects-aggregate/cn-projects/cn-project.dto';

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
    };
    const request = helper.post('', project);
    request.expect(201);
    let newProject: CnProject = await request.getResponseBody();

    expect(newProject.id).toBeDefined();
    expect(newProject.code).toEqual(project.code);
    expect(newProject.title).toEqual(project.title);
    expect(newProject.description).toEqual(project.description);
    expect(newProject.currentLevel).toEqual(CnProjectLevel.PROJECT);
    expect(newProject.currentStatus.status).toEqual(CnProjectStatus.ACTIVE);
    expect(newProject.levelStatus).toEqual(CnProjectLevelStatus.UNDEFINED);
    expect(newProject.children).toBeUndefined();

    // create work package
    const workPackage: Partial<CnProject> = {
      code: 'TEST-WP',
      title: 'Test work package',
      description: 'Test work package description',
      startingDate: ClDateHelper.getDate(),
    };

    const workPackageRequest = helper.post(`${newProject.id}/sub-project`, workPackage);
    workPackageRequest.expect(201);
    const newWorkPackage: CnProject = await workPackageRequest.getResponseBody();
    expect(newWorkPackage.currentLevel).toEqual(CnProjectLevel.WORK_PACKAGE);
    expect(newWorkPackage.rootParentId).toEqual(newProject.id);
    expect(newWorkPackage.levelStatus).toEqual(CnProjectLevelStatus.UNDEFINED);

    // refresh the new project to check the level status
    const newProjectRequest = helper.get(newProject.id);
    workPackageRequest.expect(201);
    newProject = await newProjectRequest.getResponseBody();
    expect(newProject.levelStatus).toEqual(CnProjectLevelStatus.PARENT);


    // create task
    const task: Partial<CnProject> = {
      code: 'TEST-TASK',
      title: 'Test task',
      description: 'Test task description',
      startingDate: ClDateHelper.getDate(),
    };

    const taskRequest = helper.post(`${newWorkPackage.id}/sub-project`, task);
    taskRequest.expect(201);
    const newTask: CnProject = await taskRequest.getResponseBody();
    expect(newTask.currentLevel).toEqual(CnProjectLevel.TASK);
    expect(newTask.rootParentId).toEqual(newProject.id);
    // the task level status should be a leaf
    expect(newTask.levelStatus).toEqual(CnProjectLevelStatus.LEAF);


    // retrieve the project tree
    const projectTreeRequest = helper.get(`${newProject.id}/tree`);
    projectTreeRequest.expect(200);
    const projectTree: CnProject = await projectTreeRequest.getResponseBody();
    expect(projectTree.id).toEqual(newProject.id);
    expect(projectTree.children.length).toEqual(1);
    expect(projectTree.children[0].id).toEqual(newWorkPackage.id);
    expect(projectTree.children[0].children.length).toEqual(1);
    expect(projectTree.children[0].children[0].id).toEqual(newTask.id);
    expect(projectTree.children[0].children[0].children.length).toEqual(0);

    // test get children
    const childrenRequest = helper.get(`${newProject.id}/children`);
    projectTreeRequest.expect(200);
    const children: CnProject[] = await childrenRequest.getResponseBody();
    expect(children.length).toEqual(1);
    expect(children[0].id).toEqual(newWorkPackage.id);

    // test find ancestors
    const ancestorsRequest = helper.get(`ancestors/project/${newTask.id}`);
    projectTreeRequest.expect(200);
    const ancestors: CnProjectAncestorTreeDTO[] = await ancestorsRequest.getResponseBody();
    expect(ancestors.length).toEqual(3);
    expect(ancestors[0].id).toEqual(newTask.id);
    expect(ancestors[1].id).toEqual(newWorkPackage.id);
    expect(ancestors[2].id).toEqual(newProject.id);


  });

  afterAll(async () => {
    await helper.close();
  });
});
