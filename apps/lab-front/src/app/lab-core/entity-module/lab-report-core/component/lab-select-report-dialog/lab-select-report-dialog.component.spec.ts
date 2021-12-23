import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabSelectReportDialogComponent} from './lab-select-report-dialog.component';

describe('LabSelectReportDialogComponent', () => {
  let component: LabSelectReportDialogComponent;
  let fixture: ComponentFixture<LabSelectReportDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabSelectReportDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabSelectReportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
