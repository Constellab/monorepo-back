import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaTeamPageComponent} from './ca-team-page.component';

describe('CaGroupUsersPageComponent', () => {
  let component: CaTeamPageComponent;
  let fixture: ComponentFixture<CaTeamPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaTeamPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaTeamPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
