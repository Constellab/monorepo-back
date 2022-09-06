import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PrWorkflowNodeViewerComponent} from './pr-workflow-node-viewer.component';

describe('PrWorkflowNodeViewerComponent', () => {
  let component: PrWorkflowNodeViewerComponent;
  let fixture: ComponentFixture<PrWorkflowNodeViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrWorkflowNodeViewerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrWorkflowNodeViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
