import { Test, TestingModule } from '@nestjs/testing';
import { LabInstancesService } from './lab-instances.service';

describe('LabInstancesService', () => {
  let service: LabInstancesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LabInstancesService],
    }).compile();

    service = module.get<LabInstancesService>(LabInstancesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
