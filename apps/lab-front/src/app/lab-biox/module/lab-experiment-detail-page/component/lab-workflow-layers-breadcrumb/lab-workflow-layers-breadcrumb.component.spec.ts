import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabWorkflowLayersBreadcrumbComponent} from './lab-workflow-layers-breadcrumb.component';

describe('BioxWorkflowLayersBreadcrumbComponent', () => {
  let component: LabWorkflowLayersBreadcrumbComponent;
  let fixture: ComponentFixture<LabWorkflowLayersBreadcrumbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabWorkflowLayersBreadcrumbComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabWorkflowLayersBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
