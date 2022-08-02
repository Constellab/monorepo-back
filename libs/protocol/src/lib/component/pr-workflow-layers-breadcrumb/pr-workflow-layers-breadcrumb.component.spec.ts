import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PrWorkflowLayersBreadcrumbComponent} from './pr-workflow-layers-breadcrumb.component';

describe('PrWorkflowLayersBreadcrumbComponent', () => {
  let component: PrWorkflowLayersBreadcrumbComponent;
  let fixture: ComponentFixture<PrWorkflowLayersBreadcrumbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrWorkflowLayersBreadcrumbComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrWorkflowLayersBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
