import { Test, TestingModule } from '@nestjs/testing';
import { DocumentationController } from './dn-documentation.controller';
import { DocumentationService } from './dn-documentation.service';

describe('DocumentationController', () => {
  let controller: DocumentationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentationController],
      providers: [DocumentationService],
    }).compile();

    controller = module.get<DocumentationController>(DocumentationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
