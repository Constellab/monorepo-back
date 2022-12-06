import {TestBed} from '@angular/core/testing';

import {LabVenvService} from './lab-venv.service';

describe('LabVenvService', () => {
  let service: LabVenvService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LabVenvService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
