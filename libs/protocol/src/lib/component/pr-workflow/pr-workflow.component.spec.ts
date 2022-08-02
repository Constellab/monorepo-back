import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PrWorkflowComponent} from './pr-workflow.component';

describe('PrWorkflowComponent', () => {
  let component: PrWorkflowComponent;
  let fixture: ComponentFixture<PrWorkflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrWorkflowComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
