import { Test, TestingModule } from '@nestjs/testing';
import { HnTaskController } from './hn-task.controller';
import { HnTaskService } from './hn-task.service';

describe('HnTaskController', () => {
  let controller: HnTaskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HnTaskController],
      providers: [HnTaskService],
    }).compile();

    controller = module.get<HnTaskController>(HnTaskController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
