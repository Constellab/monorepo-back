import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabWorkflowNodeViewComponent} from './lab-workflow-node-view.component';

describe('LabWorkflowNodeViewComponent', () => {
  let component: LabWorkflowNodeViewComponent;
  let fixture: ComponentFixture<LabWorkflowNodeViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabWorkflowNodeViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabWorkflowNodeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
