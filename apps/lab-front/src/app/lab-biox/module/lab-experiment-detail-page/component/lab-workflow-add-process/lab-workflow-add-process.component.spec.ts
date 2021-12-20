import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabWorkflowAddProcessComponent} from './lab-workflow-add-process.component';

describe('BioxWorkflowAddProcessComponent', () => {
  let component: LabWorkflowAddProcessComponent;
  let fixture: ComponentFixture<LabWorkflowAddProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabWorkflowAddProcessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabWorkflowAddProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
