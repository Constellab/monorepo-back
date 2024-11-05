import { Test, TestingModule } from '@nestjs/testing';
import { CnFoldersService } from './cn-folders.service';
import { CnFoldersModule } from './cn-folders.module';

describe('CnProjectsService', () => {
  let service: CnFoldersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CnFoldersService],
      imports: [CnFoldersModule],
    }).compile();

    service = module.get<CnFoldersService>(CnFoldersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
