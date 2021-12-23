import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabExperimentDetailComponent} from './lab-experiment-detail.component';

describe('LabExperimentDetailComponent', () => {
  let component: LabExperimentDetailComponent;
  let fixture: ComponentFixture<LabExperimentDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabExperimentDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabExperimentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
