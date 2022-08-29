import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabExperimentsUsingResourceComponent} from './lab-experiments-using-resource.component';

describe('LabResourcesUsedInExperimentComponent', () => {
  let component: LabExperimentsUsingResourceComponent;
  let fixture: ComponentFixture<LabExperimentsUsingResourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabExperimentsUsingResourceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabExperimentsUsingResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
