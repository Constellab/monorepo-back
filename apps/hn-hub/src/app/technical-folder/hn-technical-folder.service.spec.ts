import { Test, TestingModule } from '@nestjs/testing';
import { HnTechnicalFolderService } from './hn-technical-folder.service';

describe('HnTechnicalFolderService', () => {
  let service: HnTechnicalFolderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HnTechnicalFolderService],
    }).compile();

    service = module.get<HnTechnicalFolderService>(HnTechnicalFolderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
