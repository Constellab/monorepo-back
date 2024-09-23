import { Test, TestingModule } from '@nestjs/testing';
import { CnNotesService } from './cn-notes.service';

describe('NotesService', () => {
  let service: CnNotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CnNotesService],
    }).compile();

    service = module.get<CnNotesService>(CnNotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
