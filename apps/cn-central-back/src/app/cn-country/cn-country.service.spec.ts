import { Test, TestingModule } from '@nestjs/testing';
import { CnCountryService } from './cn-country.service';

describe('CnCountryService', () => {
  let service: CnCountryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CnCountryService],
    }).compile();

    service = module.get<CnCountryService>(CnCountryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
