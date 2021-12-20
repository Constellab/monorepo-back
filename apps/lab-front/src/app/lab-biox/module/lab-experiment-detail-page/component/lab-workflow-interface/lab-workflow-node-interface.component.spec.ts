import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabWorkflowNodeInterfaceComponent} from './lab-workflow-node-interface.component';

describe('BioxWorkflowInterfaceComponent', () => {
  let component: LabWorkflowNodeInterfaceComponent;
  let fixture: ComponentFixture<LabWorkflowNodeInterfaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabWorkflowNodeInterfaceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabWorkflowNodeInterfaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
