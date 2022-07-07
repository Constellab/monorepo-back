import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabWorkflowPortActionPortalComponent} from './lab-workflow-port-action-portal.component';

describe('LabWorkflowPortActionPortalComponent', () => {
  let component: LabWorkflowPortActionPortalComponent;
  let fixture: ComponentFixture<LabWorkflowPortActionPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabWorkflowPortActionPortalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabWorkflowPortActionPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
