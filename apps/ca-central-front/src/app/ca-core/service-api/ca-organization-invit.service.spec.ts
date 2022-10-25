import {TestBed} from '@angular/core/testing';

import {CaOrganizationInvitService} from './ca-organization-invit.service';

describe('CaOrganizationInvitService', () => {
  let service: CaOrganizationInvitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaOrganizationInvitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
