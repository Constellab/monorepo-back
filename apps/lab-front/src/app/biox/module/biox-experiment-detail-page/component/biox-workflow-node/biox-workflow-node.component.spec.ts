import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxWorkflowNodeComponent } from './biox-workflow-node.component';

describe('ExperimentWorkflowNodeComponent', () => {
  let component: BioxWorkflowNodeComponent;
  let fixture: ComponentFixture<BioxWorkflowNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxWorkflowNodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxWorkflowNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
