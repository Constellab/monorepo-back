import {TestBed} from '@angular/core/testing';

import {CaExperimentService} from './ca-experiment.service';

describe('ExperimentService', () => {
  let service: CaExperimentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaExperimentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
