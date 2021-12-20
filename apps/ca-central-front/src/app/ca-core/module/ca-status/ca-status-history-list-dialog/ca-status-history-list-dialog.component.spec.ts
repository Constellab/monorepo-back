import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaStatusHistoryListDialogComponent} from './ca-status-history-list-dialog.component';

describe('StatusHistoryListDialogComponent', () => {
  let component: CaStatusHistoryListDialogComponent;
  let fixture: ComponentFixture<CaStatusHistoryListDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaStatusHistoryListDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaStatusHistoryListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
