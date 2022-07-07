import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabWorkflowNodeProgressComponent} from './lab-workflow-node-progress.component';

describe('LabWorkflowNodeProgressComponent', () => {
  let component: LabWorkflowNodeProgressComponent;
  let fixture: ComponentFixture<LabWorkflowNodeProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabWorkflowNodeProgressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabWorkflowNodeProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
