import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaTeamUsersListComponent} from './ca-team-users-list.component';

describe('CaGroupUsersListComponent', () => {
  let component: CaTeamUsersListComponent;
  let fixture: ComponentFixture<CaTeamUsersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaTeamUsersListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaTeamUsersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
