import { Test, TestingModule } from '@nestjs/testing';
import { HnDocumentationController } from './hn-documentation.controller';
import { HnDocumentationService } from './hn-documentation.service';

describe('HnDocumentationController', () => {
  let controller: HnDocumentationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HnDocumentationController],
      providers: [HnDocumentationService],
    }).compile();

    controller = module.get<HnDocumentationController>(HnDocumentationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
