import { Test, TestingModule } from '@nestjs/testing';
import { HnBrickMajorVersionController } from './hn-brick-major-version.controller';
import { HnBrickMajorVersionService } from './hn-brick-major-version.service';

describe('HnBrickMajorVersionController', () => {
  let controller: HnBrickMajorVersionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HnBrickMajorVersionController],
      providers: [HnBrickMajorVersionService],
    }).compile();

    controller = module.get<HnBrickMajorVersionController>(HnBrickMajorVersionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
