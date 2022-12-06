import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabMonitoringDashboardPageComponent} from './lab-monitoring-dashboard-page.component';

describe('LabMonitoringDashboardPageComponent', () => {
  let component: LabMonitoringDashboardPageComponent;
  let fixture: ComponentFixture<LabMonitoringDashboardPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabMonitoringDashboardPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabMonitoringDashboardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
