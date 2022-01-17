import { Test, TestingModule } from '@nestjs/testing';
import { HnAuthService } from './hn-auth.service';

describe('AuthService', () => {
  let service: HnAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HnAuthService],
    }).compile();

    service = module.get<HnAuthService>(HnAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
