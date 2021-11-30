import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxWorkflowNodeSourceComponent } from './biox-workflow-node-source.component';

describe('BioxWorkflowNodeSourceComponent', () => {
  let component: BioxWorkflowNodeSourceComponent;
  let fixture: ComponentFixture<BioxWorkflowNodeSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxWorkflowNodeSourceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxWorkflowNodeSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
