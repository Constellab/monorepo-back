import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxWorkflowAddProcessComponent } from './biox-workflow-add-process.component';

describe('BioxWorkflowAddProcessComponent', () => {
  let component: BioxWorkflowAddProcessComponent;
  let fixture: ComponentFixture<BioxWorkflowAddProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxWorkflowAddProcessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxWorkflowAddProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
