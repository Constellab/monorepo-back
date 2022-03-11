import {TestBed} from '@angular/core/testing';

import {CaOrganizationService} from './ca-organization.service';

describe('CaOrganizationService', () => {
  let service: CaOrganizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaOrganizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
