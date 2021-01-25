import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxWorkflowLayersBreadcrumbComponent } from './biox-workflow-layers-breadcrumb.component';

describe('BioxWorkflowLayersBreadcrumbComponent', () => {
  let component: BioxWorkflowLayersBreadcrumbComponent;
  let fixture: ComponentFixture<BioxWorkflowLayersBreadcrumbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxWorkflowLayersBreadcrumbComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxWorkflowLayersBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
