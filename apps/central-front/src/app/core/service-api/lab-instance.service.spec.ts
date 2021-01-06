import {TestBed} from '@angular/core/testing';

import {LabInstanceService} from './lab-instance.service';

describe('LabInstanceService', () => {
  let service: LabInstanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LabInstanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
