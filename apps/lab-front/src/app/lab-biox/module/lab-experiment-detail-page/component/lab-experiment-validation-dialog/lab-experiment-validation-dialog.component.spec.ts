import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabExperimentValidationDialogComponent} from './lab-experiment-validation-dialog.component';

describe('BioxExperimentValidationDialogComponent', () => {
  let component: LabExperimentValidationDialogComponent;
  let fixture: ComponentFixture<LabExperimentValidationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabExperimentValidationDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabExperimentValidationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
