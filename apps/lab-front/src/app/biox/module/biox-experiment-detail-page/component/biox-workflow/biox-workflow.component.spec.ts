import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxWorkflowComponent } from './biox-workflow.component';

describe('ExperimentWorkflowComponent', () => {
  let component: BioxWorkflowComponent;
  let fixture: ComponentFixture<BioxWorkflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxWorkflowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
