import { Test, TestingModule } from '@nestjs/testing';
import { DnDocumentationService } from './dn-documentation.service';

describe('DocumentationService', () => {
  let service: DnDocumentationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DnDocumentationService],
    }).compile();

    service = module.get<DnDocumentationService>(DnDocumentationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
