import { Test, TestingModule } from '@nestjs/testing';
import { DnVersionController } from './dn-version.controller';
import { DnVersionService } from './dn-version.service';

describe('VersionController', () => {
  let controller: DnVersionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DnVersionController],
      providers: [DnVersionService],
    }).compile();

    controller = module.get<DnVersionController>(DnVersionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
