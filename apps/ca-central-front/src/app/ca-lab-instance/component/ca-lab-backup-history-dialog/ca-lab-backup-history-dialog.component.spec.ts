import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabBackupHistoryDialogComponent} from './ca-lab-backup-history-dialog.component';

describe('CaLabBackupHistoryDialogComponent', () => {
  let component: CaLabBackupHistoryDialogComponent;
  let fixture: ComponentFixture<CaLabBackupHistoryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabBackupHistoryDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaLabBackupHistoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
