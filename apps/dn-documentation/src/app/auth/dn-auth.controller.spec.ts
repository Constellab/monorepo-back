import { Test, TestingModule } from '@nestjs/testing';
import { DnAuthController } from './dn-auth.controller';

describe('DnAuthController', () => {
  let controller: DnAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DnAuthController],
    }).compile();

    controller = module.get<DnAuthController>(DnAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
