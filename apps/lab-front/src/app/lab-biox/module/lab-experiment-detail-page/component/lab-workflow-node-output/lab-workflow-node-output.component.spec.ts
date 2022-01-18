import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabWorkflowNodeOutputComponent} from './lab-workflow-node-output.component';

describe('LabWorkflowNodeoutputComponent', () => {
  let component: LabWorkflowNodeOutputComponent;
  let fixture: ComponentFixture<LabWorkflowNodeOutputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabWorkflowNodeOutputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabWorkflowNodeOutputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
