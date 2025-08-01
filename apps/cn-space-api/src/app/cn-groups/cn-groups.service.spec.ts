import { Test, TestingModule } from '@nestjs/testing';

import { CnGroupsService } from './cn-groups.service';

describe('GroupsService', () => {
  let service: CnGroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CnGroupsService],
    }).compile();

    service = module.get<CnGroupsService>(CnGroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
