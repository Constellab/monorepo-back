import {Test, TestingModule} from '@nestjs/testing';
import {CnAuthController} from './cnAuthController';

describe('AuthController', () => {
  let controller: CnAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CnAuthController],
    }).compile();

    controller = module.get<CnAuthController>(CnAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
