import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabMonitorBetweenDatesDialogComponent} from './lab-monitor-between-dates-dialog.component';

describe('LabMonitorBetweenDatesDialogComponent', () => {
  let component: LabMonitorBetweenDatesDialogComponent;
  let fixture: ComponentFixture<LabMonitorBetweenDatesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabMonitorBetweenDatesDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabMonitorBetweenDatesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
