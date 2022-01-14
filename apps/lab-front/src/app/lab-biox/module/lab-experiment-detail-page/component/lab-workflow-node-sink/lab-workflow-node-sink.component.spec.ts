import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabWorkflowNodeSinkComponent} from './lab-workflow-node-sink.component';

describe('LabWorkflowNodeSinkComponent', () => {
  let component: LabWorkflowNodeSinkComponent;
  let fixture: ComponentFixture<LabWorkflowNodeSinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabWorkflowNodeSinkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabWorkflowNodeSinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
