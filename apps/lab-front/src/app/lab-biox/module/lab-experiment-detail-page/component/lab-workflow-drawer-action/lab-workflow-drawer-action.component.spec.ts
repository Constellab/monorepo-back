import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabWorkflowDrawerActionComponent} from './lab-workflow-drawer-action.component';

describe('BioxWorkflowDrawerContentComponent', () => {
  let component: LabWorkflowDrawerActionComponent;
  let fixture: ComponentFixture<LabWorkflowDrawerActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabWorkflowDrawerActionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabWorkflowDrawerActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
