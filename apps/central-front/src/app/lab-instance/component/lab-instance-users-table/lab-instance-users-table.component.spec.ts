import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabInstanceUsersTableComponent } from './lab-instance-users-table.component';

describe('LabInstanceUsersTableComponent', () => {
  let component: LabInstanceUsersTableComponent;
  let fixture: ComponentFixture<LabInstanceUsersTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabInstanceUsersTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabInstanceUsersTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
