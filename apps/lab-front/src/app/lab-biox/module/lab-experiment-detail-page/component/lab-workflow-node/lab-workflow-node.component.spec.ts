import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabWorkflowNodeComponent} from './lab-workflow-node.component';

describe('ExperimentWorkflowNodeComponent', () => {
  let component: LabWorkflowNodeComponent;
  let fixture: ComponentFixture<LabWorkflowNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabWorkflowNodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabWorkflowNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
