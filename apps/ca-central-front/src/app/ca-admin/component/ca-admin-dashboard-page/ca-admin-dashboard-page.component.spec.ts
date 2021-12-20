import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaAdminDashboardPageComponent} from './ca-admin-dashboard-page.component';

describe('AdminDashboardComponent', () => {
  let component: CaAdminDashboardPageComponent;
  let fixture: ComponentFixture<CaAdminDashboardPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaAdminDashboardPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaAdminDashboardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
