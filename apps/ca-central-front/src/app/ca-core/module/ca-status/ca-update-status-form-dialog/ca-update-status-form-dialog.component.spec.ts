import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaUpdateStatusFormDialogComponent} from './ca-update-status-form-dialog.component';

describe('UpdateStatusFormDialogComponent', () => {
  let component: CaUpdateStatusFormDialogComponent;
  let fixture: ComponentFixture<CaUpdateStatusFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaUpdateStatusFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaUpdateStatusFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
