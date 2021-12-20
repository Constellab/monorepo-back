import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaDashboardProjectsComponent} from './ca-dashboard-projects.component';

describe('DashboardProjectsComponent', () => {
  let component: CaDashboardProjectsComponent;
  let fixture: ComponentFixture<CaDashboardProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaDashboardProjectsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaDashboardProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
