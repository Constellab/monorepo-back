import { Test, TestingModule } from '@nestjs/testing';
import { HnAuthController } from './hn-auth.controller';

describe('DnAuthController', () => {
  let controller: HnAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HnAuthController],
    }).compile();

    controller = module.get<HnAuthController>(HnAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
