import { TestBed } from '@angular/core/testing';

import { LoadUserGuard } from './load-user.guard';

describe('LoadUserGuard', () => {
  let guard: LoadUserGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(LoadUserGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
