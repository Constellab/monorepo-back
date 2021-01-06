import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ExperimentFormDialogComponent} from './experiment-form-dialog.component';

describe('ExperimentFormDialogComponent', () => {
  let component: ExperimentFormDialogComponent;
  let fixture: ComponentFixture<ExperimentFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExperimentFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperimentFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
