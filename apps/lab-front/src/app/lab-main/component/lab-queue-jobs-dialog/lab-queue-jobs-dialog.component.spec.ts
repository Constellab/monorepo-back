import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabQueueJobsDialogComponent} from './lab-queue-jobs-dialog.component';

describe('LabQueueJobsDialogComponent', () => {
  let component: LabQueueJobsDialogComponent;
  let fixture: ComponentFixture<LabQueueJobsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabQueueJobsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabQueueJobsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
