import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxExperimentFormDialogComponent } from './biox-experiment-form-dialog.component';

describe('BioxExperimentFormDialogComponent', () => {
  let component: BioxExperimentFormDialogComponent;
  let fixture: ComponentFixture<BioxExperimentFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxExperimentFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxExperimentFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
