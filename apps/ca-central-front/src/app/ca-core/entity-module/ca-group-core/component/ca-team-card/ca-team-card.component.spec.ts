import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaTeamCardComponent} from './ca-team-card.component';

describe('CaGroupCardComponent', () => {
  let component: CaTeamCardComponent;
  let fixture: ComponentFixture<CaTeamCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaTeamCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaTeamCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
