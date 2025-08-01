import { Test, TestingModule } from '@nestjs/testing';

import { CnCityController } from './cn-city.controller';
import { CnCityService } from './cn-city.service';

describe('CnCityController', () => {
  let controller: CnCityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CnCityController],
      providers: [CnCityService],
    }).compile();

    controller = module.get<CnCityController>(CnCityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
