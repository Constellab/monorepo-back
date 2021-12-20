import {Test, TestingModule} from '@nestjs/testing';
import {CnLabInstancesService} from './cn-lab-instances.service';

describe('LabInstancesService', () => {
  let service: CnLabInstancesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CnLabInstancesService],
    }).compile();

    service = module.get<CnLabInstancesService>(CnLabInstancesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
