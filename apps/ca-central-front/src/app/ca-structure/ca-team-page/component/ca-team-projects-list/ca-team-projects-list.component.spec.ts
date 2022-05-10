import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaTeamProjectsListComponent} from './ca-team-projects-list.component';

describe('CaGroupProjectsListComponent', () => {
  let component: CaTeamProjectsListComponent;
  let fixture: ComponentFixture<CaTeamProjectsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaTeamProjectsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaTeamProjectsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
