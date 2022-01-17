import { Test, TestingModule } from '@nestjs/testing';
import { HnFolderService } from './hn-folder.service';

describe('FolderService', () => {
  let service: HnFolderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HnFolderService],
    }).compile();

    service = module.get<HnFolderService>(HnFolderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
