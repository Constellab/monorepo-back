import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlConfirmDialogComponent } from './fl-confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: FlConfirmDialogComponent;
  let fixture: ComponentFixture<FlConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlConfirmDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
