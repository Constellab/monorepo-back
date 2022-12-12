import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabMonitoringUsagePageComponent} from './lab-monitoring-usage-page.component';

describe('LabMonitoringUsagePageComponent', () => {
  let component: LabMonitoringUsagePageComponent;
  let fixture: ComponentFixture<LabMonitoringUsagePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabMonitoringUsagePageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabMonitoringUsagePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
