import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaExperimentFormDialogComponent} from './ca-experiment-form-dialog.component';

describe('ExperimentFormDialogComponent', () => {
  let component: CaExperimentFormDialogComponent;
  let fixture: ComponentFixture<CaExperimentFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaExperimentFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaExperimentFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
