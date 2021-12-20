import {TestBed} from '@angular/core/testing';

import {CaLabService} from './ca-lab.service';

describe('LabService', () => {
  let service: CaLabService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaLabService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
