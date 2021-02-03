import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxWorkflowInterfaceComponent } from './biox-workflow-interface.component';

describe('BioxWorkflowInterfaceComponent', () => {
  let component: BioxWorkflowInterfaceComponent;
  let fixture: ComponentFixture<BioxWorkflowInterfaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxWorkflowInterfaceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxWorkflowInterfaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
