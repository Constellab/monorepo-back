import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaCurrentOrgaTeamsListComponent} from './ca-current-orga-teams-list.component';

describe('CaCurrentOrgaTeamsListComponent', () => {
  let component: CaCurrentOrgaTeamsListComponent;
  let fixture: ComponentFixture<CaCurrentOrgaTeamsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaCurrentOrgaTeamsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaCurrentOrgaTeamsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
