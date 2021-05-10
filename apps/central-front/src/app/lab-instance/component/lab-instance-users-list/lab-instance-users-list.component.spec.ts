import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabInstanceUsersListComponent } from './lab-instance-users-list.component';

describe('LabInstanceUsersListComponent', () => {
  let component: LabInstanceUsersListComponent;
  let fixture: ComponentFixture<LabInstanceUsersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabInstanceUsersListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabInstanceUsersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
