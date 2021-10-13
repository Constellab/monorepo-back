import { Test, TestingModule } from '@nestjs/testing';
import { DnAuthService } from './dn-auth.service';

describe('AuthService', () => {
  let service: DnAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DnAuthService],
    }).compile();

    service = module.get<DnAuthService>(DnAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
