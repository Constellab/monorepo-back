import { Test, TestingModule } from '@nestjs/testing';
import { ServersInfoService } from './servers-info.service';

describe('ServersInfoService', () => {
  let service: ServersInfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServersInfoService],
    }).compile();

    service = module.get<ServersInfoService>(ServersInfoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
