import { Test, TestingModule } from '@nestjs/testing';

import { CnCountryController } from './cn-country.controller';
import { CnCountryService } from './cn-country.service';

describe('CnCountryController', () => {
  let controller: CnCountryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CnCountryController],
      providers: [CnCountryService],
    }).compile();

    controller = module.get<CnCountryController>(CnCountryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
