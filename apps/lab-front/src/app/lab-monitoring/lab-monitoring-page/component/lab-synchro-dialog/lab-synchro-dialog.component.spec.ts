import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabSynchroDialogComponent} from './lab-synchro-dialog.component';

describe('LabSynchroDialogComponent', () => {
  let component: LabSynchroDialogComponent;
  let fixture: ComponentFixture<LabSynchroDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabSynchroDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabSynchroDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
