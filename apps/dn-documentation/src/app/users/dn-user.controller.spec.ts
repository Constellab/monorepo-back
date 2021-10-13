import { Test, TestingModule } from '@nestjs/testing';
import { DnUserController } from './dn-user.controller';
import { DnUserService } from './dn-user.service';

describe('UserController', () => {
  let controller: DnUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DnUserController],
      providers: [DnUserService],
    }).compile();

    controller = module.get<DnUserController>(DnUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
