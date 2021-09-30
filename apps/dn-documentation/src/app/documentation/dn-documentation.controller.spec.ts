import { Test, TestingModule } from '@nestjs/testing';
import { DnDocumentationController } from './dn-documentation.controller';
import { DnDocumentationService } from './dn-documentation.service';

describe('DocumentationController', () => {
  let controller: DnDocumentationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DnDocumentationController],
      providers: [DnDocumentationService],
    }).compile();

    controller = module.get<DnDocumentationController>(DnDocumentationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
