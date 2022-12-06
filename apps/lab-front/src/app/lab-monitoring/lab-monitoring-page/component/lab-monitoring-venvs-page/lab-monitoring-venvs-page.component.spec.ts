import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabMonitoringVenvsPageComponent} from './lab-monitoring-venvs-page.component';

describe('LabMonitoringVenvPageComponent', () => {
  let component: LabMonitoringVenvsPageComponent;
  let fixture: ComponentFixture<LabMonitoringVenvsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabMonitoringVenvsPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabMonitoringVenvsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
