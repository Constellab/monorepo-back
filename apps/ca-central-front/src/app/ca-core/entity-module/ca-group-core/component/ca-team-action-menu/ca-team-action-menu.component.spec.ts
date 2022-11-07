import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaTeamActionMenuComponent} from './ca-team-action-menu.component';

describe('CaTeamActionMenuComponent', () => {
  let component: CaTeamActionMenuComponent;
  let fixture: ComponentFixture<CaTeamActionMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaTeamActionMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaTeamActionMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
