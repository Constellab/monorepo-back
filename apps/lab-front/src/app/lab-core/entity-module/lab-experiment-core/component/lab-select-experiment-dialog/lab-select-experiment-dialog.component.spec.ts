import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabSelectExperimentDialogComponent} from './lab-select-experiment-dialog.component';

describe('LabSelectExperimentDialogComponent', () => {
  let component: LabSelectExperimentDialogComponent;
  let fixture: ComponentFixture<LabSelectExperimentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabSelectExperimentDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabSelectExperimentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
