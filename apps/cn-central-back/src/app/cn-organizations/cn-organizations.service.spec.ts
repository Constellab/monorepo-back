import {Test, TestingModule} from '@nestjs/testing';
import {CnOrganizationsService} from './cn-organizations.service';

describe('OrganizationsService', () => {
  let service: CnOrganizationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CnOrganizationsService],
    }).compile();

    service = module.get<CnOrganizationsService>(CnOrganizationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
