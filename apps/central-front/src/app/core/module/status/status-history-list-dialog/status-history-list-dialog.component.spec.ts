import {ComponentFixture, TestBed} from '@angular/core/testing';

import {StatusHistoryListDialogComponent} from './status-history-list-dialog.component';

describe('StatusHistoryListDialogComponent', () => {
  let component: StatusHistoryListDialogComponent;
  let fixture: ComponentFixture<StatusHistoryListDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatusHistoryListDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusHistoryListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
