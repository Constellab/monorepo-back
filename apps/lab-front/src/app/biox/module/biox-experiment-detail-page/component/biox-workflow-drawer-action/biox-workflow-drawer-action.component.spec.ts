import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxWorkflowAction } from './biox-workflow-drawer-action.component';

describe('BioxWorkflowDrawerContentComponent', () => {
  let component: BioxWorkflowAction;
  let fixture: ComponentFixture<BioxWorkflowAction>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxWorkflowAction ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxWorkflowAction);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
