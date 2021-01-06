import { Test, TestingModule } from '@nestjs/testing';
import { LabInstancesController } from './lab-instances.controller';

describe('LabInstancesController', () => {
  let controller: LabInstancesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LabInstancesController],
    }).compile();

    controller = module.get<LabInstancesController>(LabInstancesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
