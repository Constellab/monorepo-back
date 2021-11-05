import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabMonitoringPageComponent} from './lab-monitoring-page.component';

describe('LabMonitoringPageComponent', () => {
  let component: LabMonitoringPageComponent;
  let fixture: ComponentFixture<LabMonitoringPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabMonitoringPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabMonitoringPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
