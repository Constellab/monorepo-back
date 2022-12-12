import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabMonitorBetweenDatesComponent} from './lab-monitor-between-dates.component';

describe('LabMonitorBetweenDatesComponent', () => {
  let component: LabMonitorBetweenDatesComponent;
  let fixture: ComponentFixture<LabMonitorBetweenDatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabMonitorBetweenDatesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabMonitorBetweenDatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
