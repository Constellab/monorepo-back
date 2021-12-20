import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceUsersTableComponent} from './ca-lab-instance-users-table.component';

describe('LabInstanceUsersTableComponent', () => {
  let component: CaLabInstanceUsersTableComponent;
  let fixture: ComponentFixture<CaLabInstanceUsersTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceUsersTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabInstanceUsersTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
