import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabWorkflowNodeConfigComponent} from './lab-workflow-node-config.component';

describe('BioxWorkflowNodeConfigComponent', () => {
  let component: LabWorkflowNodeConfigComponent;
  let fixture: ComponentFixture<LabWorkflowNodeConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabWorkflowNodeConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabWorkflowNodeConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
