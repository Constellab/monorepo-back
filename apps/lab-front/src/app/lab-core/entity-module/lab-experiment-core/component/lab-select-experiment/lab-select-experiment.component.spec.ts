import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabSelectExperimentComponent} from './lab-select-experiment.component';

describe('LabSelectExperimentComponent', () => {
  let component: LabSelectExperimentComponent;
  let fixture: ComponentFixture<LabSelectExperimentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabSelectExperimentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabSelectExperimentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
