import { Test, TestingModule } from '@nestjs/testing';
import { CnProjectCommentController } from './cn-project-comment.controller';
import { CnProjectCommentService } from './cn-project-comment.service';

describe('CnProjectCommentController', () => {
  let controller: CnProjectCommentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CnProjectCommentController],
      providers: [CnProjectCommentService],
    }).compile();

    controller = module.get<CnProjectCommentController>(
      CnProjectCommentController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
