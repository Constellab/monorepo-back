import {TestBed} from '@angular/core/testing';

import {CaSpaceService} from './ca-space.service';

describe('CaSpaceService', () => {
  let service: CaSpaceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaSpaceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
