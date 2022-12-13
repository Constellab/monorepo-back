import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaAdminUsersPageComponent} from './ca-admin-users-page.component';

describe('CaAdminUsersPageComponent', () => {
  let component: CaAdminUsersPageComponent;
  let fixture: ComponentFixture<CaAdminUsersPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaAdminUsersPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaAdminUsersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
