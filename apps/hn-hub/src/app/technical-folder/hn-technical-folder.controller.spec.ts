import { Test, TestingModule } from '@nestjs/testing';
import { HnTechnicalFolderController } from './hn-technical-folder.controller';
import { HnTechnicalFolderService } from './hn-technical-folder.service';

describe('HnTechnicalFolderController', () => {
  let controller: HnTechnicalFolderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HnTechnicalFolderController],
      providers: [HnTechnicalFolderService],
    }).compile();

    controller = module.get<HnTechnicalFolderController>(
      HnTechnicalFolderController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
