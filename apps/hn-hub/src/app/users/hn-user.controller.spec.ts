import { Test, TestingModule } from '@nestjs/testing';
import { HnUserController } from './hn-user.controller';
import { HnUserService } from './hn-user.service';

describe('UserController', () => {
  let controller: HnUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HnUserController],
      providers: [HnUserService],
    }).compile();

    controller = module.get<HnUserController>(HnUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
