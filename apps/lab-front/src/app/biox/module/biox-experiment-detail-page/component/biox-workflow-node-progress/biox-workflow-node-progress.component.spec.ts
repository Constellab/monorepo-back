import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxWorkflowNodeProgressComponent } from './biox-workflow-node-progress.component';

describe('BioxWorkflowNodeProgressComponent', () => {
  let component: BioxWorkflowNodeProgressComponent;
  let fixture: ComponentFixture<BioxWorkflowNodeProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxWorkflowNodeProgressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxWorkflowNodeProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
