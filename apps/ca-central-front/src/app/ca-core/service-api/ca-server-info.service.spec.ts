import {TestBed} from '@angular/core/testing';

import {CaServerInfoService} from './ca-server-info.service';

describe('ServerInfoService', () => {
  let service: CaServerInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaServerInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
