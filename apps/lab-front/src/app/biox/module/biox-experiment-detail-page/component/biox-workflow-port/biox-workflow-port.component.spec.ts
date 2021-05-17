import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxWorkflowPortComponent } from './biox-workflow-port.component';

describe('BioxWorkflowPortComponent', () => {
  let component: BioxWorkflowPortComponent;
  let fixture: ComponentFixture<BioxWorkflowPortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxWorkflowPortComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxWorkflowPortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
