import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaReportTableComponent} from './ca-report-table.component';

describe('CaReportTableComponent', () => {
  let component: CaReportTableComponent;
  let fixture: ComponentFixture<CaReportTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaReportTableComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CaReportTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
