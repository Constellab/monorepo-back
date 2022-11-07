import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaTeamTableComponent} from './ca-team-table.component';

describe('CaTeamTableComponent', () => {
  let component: CaTeamTableComponent;
  let fixture: ComponentFixture<CaTeamTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaTeamTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaTeamTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
