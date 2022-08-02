import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PrWorkflowNodeComponent} from './pr-workflow-node.component';

describe('PrWorkflowNodeComponent', () => {
  let component: PrWorkflowNodeComponent;
  let fixture: ComponentFixture<PrWorkflowNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrWorkflowNodeComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrWorkflowNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
