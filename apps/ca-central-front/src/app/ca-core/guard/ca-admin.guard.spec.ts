import {TestBed} from '@angular/core/testing';

import {CaAdminGuard} from './ca-admin-guard.service';

describe('AdminGuard', () => {
  let guard: CaAdminGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(CaAdminGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
