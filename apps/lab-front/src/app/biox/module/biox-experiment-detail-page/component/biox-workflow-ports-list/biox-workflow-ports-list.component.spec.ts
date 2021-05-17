import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxWorkflowPortsListComponent } from './biox-workflow-ports-list.component';

describe('BioxWorkflowPortsListComponent', () => {
  let component: BioxWorkflowPortsListComponent;
  let fixture: ComponentFixture<BioxWorkflowPortsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxWorkflowPortsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxWorkflowPortsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
