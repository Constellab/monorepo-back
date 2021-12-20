import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabWorkflowNodeSourceComponent} from './lab-workflow-node-source.component';

describe('BioxWorkflowNodeSourceComponent', () => {
  let component: LabWorkflowNodeSourceComponent;
  let fixture: ComponentFixture<LabWorkflowNodeSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabWorkflowNodeSourceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabWorkflowNodeSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
