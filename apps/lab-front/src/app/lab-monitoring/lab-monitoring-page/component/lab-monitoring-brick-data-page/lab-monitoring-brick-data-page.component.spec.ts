import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabMonitoringBrickDataPageComponent} from './lab-monitoring-brick-data-page.component';

describe('LabBrickDataPageComponent', () => {
  let component: LabMonitoringBrickDataPageComponent;
  let fixture: ComponentFixture<LabMonitoringBrickDataPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabMonitoringBrickDataPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabMonitoringBrickDataPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
