import { Test, TestingModule } from '@nestjs/testing';
import { CnGroupsController } from './cn-groups.controller';

describe('GroupsController', () => {
  let controller: CnGroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CnGroupsController],
    }).compile();

    controller = module.get<CnGroupsController>(CnGroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
