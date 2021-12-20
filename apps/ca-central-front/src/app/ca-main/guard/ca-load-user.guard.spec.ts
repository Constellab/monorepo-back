import {TestBed} from '@angular/core/testing';

import {CaLoadUserGuard} from './ca-load-user.guard';

describe('LoadUserGuard', () => {
  let guard: CaLoadUserGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(CaLoadUserGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
