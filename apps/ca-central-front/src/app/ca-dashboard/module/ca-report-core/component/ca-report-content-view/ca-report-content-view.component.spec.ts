import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaReportContentViewComponent} from './ca-report-content-view.component';

describe('CaReportContentViewComponent', () => {
  let component: CaReportContentViewComponent;
  let fixture: ComponentFixture<CaReportContentViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaReportContentViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaReportContentViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
