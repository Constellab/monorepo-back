import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabWorkflowComponent} from './lab-workflow.component';

describe('ExperimentWorkflowComponent', () => {
  let component: LabWorkflowComponent;
  let fixture: ComponentFixture<LabWorkflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabWorkflowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
