import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxWorkflowNodeDetailComponent } from './biox-workflow-node-detail.component';

describe('BioxWorkflowNodeDetailComponent', () => {
  let component: BioxWorkflowNodeDetailComponent;
  let fixture: ComponentFixture<BioxWorkflowNodeDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxWorkflowNodeDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxWorkflowNodeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
