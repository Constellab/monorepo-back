import {Test, TestingModule} from '@nestjs/testing';
import {CnServersInfoService} from './cn-servers-info.service';

describe('ServersInfoService', () => {
  let service: CnServersInfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CnServersInfoService],
    }).compile();

    service = module.get<CnServersInfoService>(CnServersInfoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
