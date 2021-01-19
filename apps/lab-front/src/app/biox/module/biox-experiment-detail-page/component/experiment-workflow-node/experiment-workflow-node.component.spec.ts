import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperimentWorkflowNodeComponent } from './experiment-workflow-node.component';

describe('ExperimentWorkflowNodeComponent', () => {
  let component: ExperimentWorkflowNodeComponent;
  let fixture: ComponentFixture<ExperimentWorkflowNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExperimentWorkflowNodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperimentWorkflowNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
