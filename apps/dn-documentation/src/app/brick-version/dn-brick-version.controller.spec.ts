import { Test, TestingModule } from '@nestjs/testing';
import { DnBrickVersionController } from './dn-brick-version.controller';
import { DnBrickVersionService } from './dn-brick-version.service';

describe('DnBrickVersionController', () => {
  let controller: DnBrickVersionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DnBrickVersionController],
      providers: [DnBrickVersionService],
    }).compile();

    controller = module.get<DnBrickVersionController>(DnBrickVersionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
