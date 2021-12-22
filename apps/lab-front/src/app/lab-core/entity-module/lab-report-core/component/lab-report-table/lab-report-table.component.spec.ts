import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabReportTableComponent} from './lab-report-table.component';

describe('LabReportTableComponent', () => {
  let component: LabReportTableComponent;
  let fixture: ComponentFixture<LabReportTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabReportTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabReportTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
