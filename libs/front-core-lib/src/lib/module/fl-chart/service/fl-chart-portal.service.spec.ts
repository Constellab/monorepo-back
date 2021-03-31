import { TestBed } from '@angular/core/testing';

import { FlChartPortalService } from './fl-chart-portal.service';

describe('FlChartPortalService', () => {
  let service: FlChartPortalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlChartPortalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
