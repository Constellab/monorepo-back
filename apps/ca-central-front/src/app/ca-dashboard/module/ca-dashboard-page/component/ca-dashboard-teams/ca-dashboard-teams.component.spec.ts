import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaDashboardTeamsComponent} from './ca-dashboard-teams.component';

describe('CaDashboardGroupComponent', () => {
  let component: CaDashboardTeamsComponent;
  let fixture: ComponentFixture<CaDashboardTeamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaDashboardTeamsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaDashboardTeamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
