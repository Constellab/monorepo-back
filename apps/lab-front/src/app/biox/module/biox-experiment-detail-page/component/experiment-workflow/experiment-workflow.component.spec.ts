import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperimentWorkflowComponent } from './experiment-workflow.component';

describe('ExperimentWorkflowComponent', () => {
  let component: ExperimentWorkflowComponent;
  let fixture: ComponentFixture<ExperimentWorkflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExperimentWorkflowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperimentWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
