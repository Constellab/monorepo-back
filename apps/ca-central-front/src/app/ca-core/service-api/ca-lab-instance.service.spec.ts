import {TestBed} from '@angular/core/testing';

import {CaLabInstanceService} from './ca-lab-instance.service';

describe('LabInstanceService', () => {
  let service: CaLabInstanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaLabInstanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
