import { Test, TestingModule } from '@nestjs/testing';
import { HnProtocolService } from './hn-protocol.service';

describe('ProtocolService', () => {
  let service: HnProtocolService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HnProtocolService],
    }).compile();

    service = module.get<HnProtocolService>(HnProtocolService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
