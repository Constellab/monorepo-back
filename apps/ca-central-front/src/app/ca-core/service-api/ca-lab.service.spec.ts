import {TestBed} from '@angular/core/testing';

import {CaLabConfigService} from './ca-lab-config.service';

describe('LabService', () => {
  let service: CaLabConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaLabConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
