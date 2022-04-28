import { Test, TestingModule } from '@nestjs/testing';
import { HnTaskService } from './hn-task.service';

describe('HnTaskService', () => {
  let service: HnTaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HnTaskService],
    }).compile();

    service = module.get<HnTaskService>(HnTaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
