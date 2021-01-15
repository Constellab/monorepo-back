import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabExperimentCardComponent } from './lab-experiment-card.component';

describe('LabExperimentCardComponent', () => {
  let component: LabExperimentCardComponent;
  let fixture: ComponentFixture<LabExperimentCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabExperimentCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabExperimentCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
