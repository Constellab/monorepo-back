import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceUsersListComponent} from './ca-lab-instance-users-list.component';

describe('LabInstanceUsersListComponent', () => {
  let component: CaLabInstanceUsersListComponent;
  let fixture: ComponentFixture<CaLabInstanceUsersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceUsersListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabInstanceUsersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
