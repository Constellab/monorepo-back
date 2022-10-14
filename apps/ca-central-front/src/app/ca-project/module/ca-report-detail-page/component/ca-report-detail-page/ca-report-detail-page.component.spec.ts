import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaReportDetailPageComponent} from './ca-report-detail-page.component';

describe('CaReportDetailPageComponent', () => {
  let component: CaReportDetailPageComponent;
  let fixture: ComponentFixture<CaReportDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaReportDetailPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaReportDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
