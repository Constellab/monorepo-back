import { Test, TestingModule } from '@nestjs/testing';
import { HnUserService } from './hn-user.service';

describe('UserService', () => {
  let service: HnUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HnUserService],
    }).compile();

    service = module.get<HnUserService>(HnUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
