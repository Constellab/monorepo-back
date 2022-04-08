import { Test, TestingModule } from '@nestjs/testing';
import { HnResourceController } from './hn-resource.controller';
import { HnResourceService } from './hn-resource.service';

describe('HnResourceController', () => {
  let controller: HnResourceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HnResourceController],
      providers: [HnResourceService],
    }).compile();

    controller = module.get<HnResourceController>(HnResourceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
