import {TestBed} from '@angular/core/testing';

import {CaProjectService} from './ca-project.service';

describe('ProjectService', () => {
  let service: CaProjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaProjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
