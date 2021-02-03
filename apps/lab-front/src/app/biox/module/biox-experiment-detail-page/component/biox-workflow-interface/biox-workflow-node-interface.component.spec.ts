import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxWorkflowNodeInterfaceComponent } from './biox-workflow-node-interface.component';

describe('BioxWorkflowInterfaceComponent', () => {
  let component: BioxWorkflowNodeInterfaceComponent;
  let fixture: ComponentFixture<BioxWorkflowNodeInterfaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxWorkflowNodeInterfaceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxWorkflowNodeInterfaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
