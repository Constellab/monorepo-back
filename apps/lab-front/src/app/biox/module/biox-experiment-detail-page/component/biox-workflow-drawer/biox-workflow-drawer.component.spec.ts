import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxWorkflowDrawerComponent } from './biox-workflow-drawer.component';

describe('BioxWorkflowContainerComponent', () => {
  let component: BioxWorkflowDrawerComponent;
  let fixture: ComponentFixture<BioxWorkflowDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxWorkflowDrawerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxWorkflowDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
