import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabExperimentStatusOptionsComponent} from './lab-experiment-status-options.component';

describe('BioxExperimentStatusOptionsComponent', () => {
  let component: LabExperimentStatusOptionsComponent;
  let fixture: ComponentFixture<LabExperimentStatusOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabExperimentStatusOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabExperimentStatusOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
