import { Test, TestingModule } from '@nestjs/testing';

import { CnCityService } from './cn-city.service';

describe('CnCityService', () => {
  let service: CnCityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CnCityService],
    }).compile();

    service = module.get<CnCityService>(CnCityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
