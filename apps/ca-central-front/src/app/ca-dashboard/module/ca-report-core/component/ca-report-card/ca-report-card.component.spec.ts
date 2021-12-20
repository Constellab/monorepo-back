import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaReportCardComponent} from './ca-report-card.component';

describe('ReportCardComponent', () => {
  let component: CaReportCardComponent;
  let fixture: ComponentFixture<CaReportCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaReportCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaReportCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
