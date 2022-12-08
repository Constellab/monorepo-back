import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabLogsBetweenDatesDialogComponent} from './lab-logs-between-dates-dialog.component';

describe('LabLogsBetweenDatesDialogsComponent', () => {
  let component: LabLogsBetweenDatesDialogComponent;
  let fixture: ComponentFixture<LabLogsBetweenDatesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabLogsBetweenDatesDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabLogsBetweenDatesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
