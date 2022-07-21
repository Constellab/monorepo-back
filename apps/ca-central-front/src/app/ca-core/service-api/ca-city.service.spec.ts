import { TestBed } from '@angular/core/testing';

import { CaCountryService } from './ca-country.service';

describe('CaCityService', () => {
  let service: CaCountryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaCountryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
