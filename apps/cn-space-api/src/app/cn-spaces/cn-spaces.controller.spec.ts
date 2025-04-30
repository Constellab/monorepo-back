import { Test, TestingModule } from '@nestjs/testing';
import { CnSpacesController } from './cn-spaces.controller';

describe('SpaceController', () => {
  let controller: CnSpacesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CnSpacesController],
    }).compile();

    controller = module.get<CnSpacesController>(CnSpacesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
