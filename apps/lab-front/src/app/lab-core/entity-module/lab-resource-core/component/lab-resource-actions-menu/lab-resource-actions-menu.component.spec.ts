import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceActionsMenuComponent} from './lab-resource-actions-menu.component';

describe('LabResourceActionsMenuComponent', () => {
  let component: LabResourceActionsMenuComponent;
  let fixture: ComponentFixture<LabResourceActionsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceActionsMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceActionsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
