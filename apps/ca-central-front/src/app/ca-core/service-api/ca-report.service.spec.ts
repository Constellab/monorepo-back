import {TestBed} from '@angular/core/testing';

import {CaReportService} from './ca-report.service';

describe('ReportService', () => {
  let service: CaReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
