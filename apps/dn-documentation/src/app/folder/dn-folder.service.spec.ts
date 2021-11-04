import { Test, TestingModule } from '@nestjs/testing';
import { DnFolderService } from './dn-folder.service';

describe('FolderService', () => {
  let service: DnFolderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DnFolderService],
    }).compile();

    service = module.get<DnFolderService>(DnFolderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
