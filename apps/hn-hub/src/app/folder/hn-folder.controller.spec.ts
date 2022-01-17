import { Test, TestingModule } from '@nestjs/testing';
import { HnFolderController } from './hn-folder.controller';
import { HnFolderService } from './hn-folder.service';

describe('HnFolderController', () => {
  let controller: HnFolderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HnFolderController],
      providers: [HnFolderService],
    }).compile();

    controller = module.get<HnFolderController>(HnFolderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
