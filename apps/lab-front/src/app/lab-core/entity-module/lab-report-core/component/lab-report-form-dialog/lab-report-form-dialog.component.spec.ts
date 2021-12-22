import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabReportFormDialogComponent} from './lab-report-form-dialog.component';

describe('LabReportFormDialogComponent', () => {
  let component: LabReportFormDialogComponent;
  let fixture: ComponentFixture<LabReportFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabReportFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabReportFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
