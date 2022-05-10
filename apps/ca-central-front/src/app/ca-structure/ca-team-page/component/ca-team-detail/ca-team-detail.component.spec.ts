import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaTeamDetailComponent} from './ca-team-detail.component';

describe('CaGroupUsersDetailComponent', () => {
  let component: CaTeamDetailComponent;
  let fixture: ComponentFixture<CaTeamDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaTeamDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaTeamDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
