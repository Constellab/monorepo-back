import { Test, TestingModule } from '@nestjs/testing';

import { HnBrickVersionReferenceController } from './hn-brick-version-reference.controller';
import { HnBrickVersionReferenceService } from './hn-brick-version-reference.service';

describe('HnBrickVersionReferenceController', () => {
  let controller: HnBrickVersionReferenceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HnBrickVersionReferenceController],
      providers: [HnBrickVersionReferenceService],
    }).compile();

    controller = module.get<HnBrickVersionReferenceController>(HnBrickVersionReferenceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
