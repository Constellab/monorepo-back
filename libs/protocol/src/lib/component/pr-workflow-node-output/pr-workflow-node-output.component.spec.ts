import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PrWorkflowNodeOutputComponent} from './pr-workflow-node-output.component';

describe('PrWorkflowNodeOutputComponent', () => {
  let component: PrWorkflowNodeOutputComponent;
  let fixture: ComponentFixture<PrWorkflowNodeOutputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrWorkflowNodeOutputComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrWorkflowNodeOutputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
