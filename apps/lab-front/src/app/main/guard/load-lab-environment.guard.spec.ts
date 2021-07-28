import {TestBed} from '@angular/core/testing';

import {LoadLabEnvironmentGuard} from './load-lab-environment.guard';

describe('LoadLabEnvironmentGuard', () => {
  let guard: LoadLabEnvironmentGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(LoadLabEnvironmentGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
