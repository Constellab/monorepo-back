import {TestBed} from '@angular/core/testing';

import {CaLabIframeService} from './ca-lab-iframe.service';

describe('LabIframeService', () => {
  let service: CaLabIframeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaLabIframeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
