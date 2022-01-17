import { Test, TestingModule } from '@nestjs/testing';
import { HnDocumentationService } from './hn-documentation.service';

describe('DocumentationService', () => {
  let service: HnDocumentationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HnDocumentationService],
    }).compile();

    service = module.get<HnDocumentationService>(HnDocumentationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
