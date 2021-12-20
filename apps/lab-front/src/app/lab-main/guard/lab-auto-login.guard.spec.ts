import {TestBed} from '@angular/core/testing';

import {LabAutoLoginGuard} from './lab-auto-login.guard';

describe('AutoLoginGuard', () => {
  let guard: LabAutoLoginGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(LabAutoLoginGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
