import { Test, TestingModule } from '@nestjs/testing';
import { DnFolderController } from './dn-folder.controller';
import { DnFolderService } from './dn-folder.service';

describe('FolderController', () => {
  let controller: DnFolderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DnFolderController],
      providers: [DnFolderService],
    }).compile();

    controller = module.get<DnFolderController>(DnFolderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
