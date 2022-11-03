import { TestBed } from '@angular/core/testing';

import { CaCommentService } from './ca-comment.service';

describe('CaCommentService', () => {
  let service: CaCommentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaCommentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
