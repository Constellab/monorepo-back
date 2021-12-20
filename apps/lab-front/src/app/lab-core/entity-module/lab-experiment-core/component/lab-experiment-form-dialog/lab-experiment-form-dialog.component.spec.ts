import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabExperimentFormDialogComponent} from './lab-experiment-form-dialog.component';

describe('BioxExperimentFormDialogComponent', () => {
  let component: LabExperimentFormDialogComponent;
  let fixture: ComponentFixture<LabExperimentFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabExperimentFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabExperimentFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
