import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabWorkflowPortsListComponent} from './lab-workflow-ports-list.component';

describe('BioxWorkflowPortsListComponent', () => {
  let component: LabWorkflowPortsListComponent;
  let fixture: ComponentFixture<LabWorkflowPortsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabWorkflowPortsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabWorkflowPortsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
