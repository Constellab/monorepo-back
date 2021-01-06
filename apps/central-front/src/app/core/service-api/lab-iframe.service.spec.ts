import {TestBed} from '@angular/core/testing';

import {LabIframeService} from './lab-iframe.service';

describe('LabIframeService', () => {
  let service: LabIframeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LabIframeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
