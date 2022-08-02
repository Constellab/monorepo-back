import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PrWorkflowNodeInterfaceComponent} from './pr-workflow-node-interface.component';

describe('PrWorkflowNodeInterfaceComponent', () => {
  let component: PrWorkflowNodeInterfaceComponent;
  let fixture: ComponentFixture<PrWorkflowNodeInterfaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrWorkflowNodeInterfaceComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrWorkflowNodeInterfaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
