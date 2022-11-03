import { Test, TestingModule } from '@nestjs/testing';
import { CnProjectCommentService } from './cn-project-comment.service';

describe('CnProjectCommentService', () => {
  let service: CnProjectCommentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CnProjectCommentService],
    }).compile();

    service = module.get<CnProjectCommentService>(CnProjectCommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
