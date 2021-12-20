import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabWorkflowActionsComponent} from './lab-workflow-actions.component';

describe('BioxWorkflowActionsComponent', () => {
  let component: LabWorkflowActionsComponent;
  let fixture: ComponentFixture<LabWorkflowActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabWorkflowActionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabWorkflowActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
