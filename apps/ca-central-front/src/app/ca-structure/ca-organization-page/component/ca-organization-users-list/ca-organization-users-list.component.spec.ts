import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaOrganizationUsersListComponent} from './ca-organization-users-list.component';

describe('CaOrganizationUsersListComponent', () => {
  let component: CaOrganizationUsersListComponent;
  let fixture: ComponentFixture<CaOrganizationUsersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaOrganizationUsersListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaOrganizationUsersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
