import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxWorkflowNodeConfigComponent } from './biox-workflow-node-config.component';

describe('BioxWorkflowNodeConfigComponent', () => {
  let component: BioxWorkflowNodeConfigComponent;
  let fixture: ComponentFixture<BioxWorkflowNodeConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxWorkflowNodeConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxWorkflowNodeConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
