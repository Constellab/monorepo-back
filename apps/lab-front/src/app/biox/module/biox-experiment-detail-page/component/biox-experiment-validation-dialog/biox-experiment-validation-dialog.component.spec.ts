import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxExperimentValidationDialogComponent} from './biox-experiment-validation-dialog.component';

describe('BioxExperimentValidationDialogComponent', () => {
  let component: BioxExperimentValidationDialogComponent;
  let fixture: ComponentFixture<BioxExperimentValidationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxExperimentValidationDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxExperimentValidationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
