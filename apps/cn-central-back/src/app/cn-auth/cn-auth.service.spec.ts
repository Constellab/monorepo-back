import { Test, TestingModule } from '@nestjs/testing';
import { CnAuthService } from './cn-auth.service';

describe('AuthService', () => {
  let service: CnAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CnAuthService],
    }).compile();

    service = module.get<CnAuthService>(CnAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
