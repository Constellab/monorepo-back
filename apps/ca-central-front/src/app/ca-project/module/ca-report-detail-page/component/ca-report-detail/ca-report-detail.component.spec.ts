import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaReportDetailComponent} from './ca-report-detail.component';

describe('CaReportDetailComponent', () => {
  let component: CaReportDetailComponent;
  let fixture: ComponentFixture<CaReportDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaReportDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaReportDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
