import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabWorkflowNodeDetailComponent} from './lab-workflow-node-detail.component';

describe('BioxWorkflowNodeDetailComponent', () => {
  let component: LabWorkflowNodeDetailComponent;
  let fixture: ComponentFixture<LabWorkflowNodeDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabWorkflowNodeDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabWorkflowNodeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
