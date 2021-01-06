import { Test, TestingModule } from '@nestjs/testing';
import { ExternalLabsController } from './external-labs.controller';

describe('ExternalLabsController', () => {
  let controller: ExternalLabsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExternalLabsController],
    }).compile();

    controller = module.get<ExternalLabsController>(ExternalLabsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
