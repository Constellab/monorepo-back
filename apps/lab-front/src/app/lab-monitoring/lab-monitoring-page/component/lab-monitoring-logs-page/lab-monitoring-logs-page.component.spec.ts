import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabMonitoringLogsPageComponent} from './lab-monitoring-logs-page.component';

describe('LabMonitoringLogsPageComponent', () => {
  let component: LabMonitoringLogsPageComponent;
  let fixture: ComponentFixture<LabMonitoringLogsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabMonitoringLogsPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabMonitoringLogsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
