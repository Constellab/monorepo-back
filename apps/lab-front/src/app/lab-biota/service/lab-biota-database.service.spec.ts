import {TestBed} from '@angular/core/testing';

import {LabBiotaDatabaseService} from './lab-biota-database.service';

describe('BiotaDatabaseService', () => {
  let service: LabBiotaDatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LabBiotaDatabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
