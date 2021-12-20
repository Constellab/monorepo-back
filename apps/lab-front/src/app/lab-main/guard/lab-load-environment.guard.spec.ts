import {TestBed} from '@angular/core/testing';

import {LabLoadEnvironmentGuard} from './lab-load-environment.guard';

describe('LoadLabEnvironmentGuard', () => {
  let guard: LabLoadEnvironmentGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(LabLoadEnvironmentGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
