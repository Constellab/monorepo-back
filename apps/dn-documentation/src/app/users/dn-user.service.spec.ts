import { Test, TestingModule } from '@nestjs/testing';
import { DnUserService } from './dn-user.service';

describe('UserService', () => {
  let service: DnUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DnUserService],
    }).compile();

    service = module.get<DnUserService>(DnUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
