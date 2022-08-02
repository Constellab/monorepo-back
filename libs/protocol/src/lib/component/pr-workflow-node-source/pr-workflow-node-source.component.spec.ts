import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PrWorkflowNodeSourceComponent} from './pr-workflow-node-source.component';

describe('PrWorkflowNodeSourceComponent', () => {
  let component: PrWorkflowNodeSourceComponent;
  let fixture: ComponentFixture<PrWorkflowNodeSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrWorkflowNodeSourceComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrWorkflowNodeSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
