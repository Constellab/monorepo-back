import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxWorkflowActionsComponent } from './biox-workflow-actions.component';

describe('BioxWorkflowActionsComponent', () => {
  let component: BioxWorkflowActionsComponent;
  let fixture: ComponentFixture<BioxWorkflowActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxWorkflowActionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxWorkflowActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
