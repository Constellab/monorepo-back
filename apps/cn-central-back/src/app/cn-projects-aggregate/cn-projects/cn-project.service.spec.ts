import {Test, TestingModule} from '@nestjs/testing';
import {CnProjectsService} from './cn-projects.service';
import {CnProjectsModule} from './cn-projects.module';

describe('CnProjectsService', () => {
  let service: CnProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CnProjectsService],
      imports: [CnProjectsModule]
    }).compile();

    service = module.get<CnProjectsService>(CnProjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
