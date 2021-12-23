import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabExperimentAssociatedReportsComponent} from './lab-experiment-associated-reports.component';

describe('LabExperimentAssociatedReportsComponent', () => {
  let component: LabExperimentAssociatedReportsComponent;
  let fixture: ComponentFixture<LabExperimentAssociatedReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabExperimentAssociatedReportsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabExperimentAssociatedReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
