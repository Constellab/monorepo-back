import {TestBed} from '@angular/core/testing';

import {CaSpaceInvitService} from './ca-space-invit.service';

describe('CaSpaceInvitService', () => {
  let service: CaSpaceInvitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaSpaceInvitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
