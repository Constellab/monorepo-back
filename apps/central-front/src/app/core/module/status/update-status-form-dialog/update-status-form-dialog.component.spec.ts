import {ComponentFixture, TestBed} from '@angular/core/testing';

import {UpdateStatusFormDialogComponent} from './update-status-form-dialog.component';

describe('UpdateStatusFormDialogComponent', () => {
  let component: UpdateStatusFormDialogComponent;
  let fixture: ComponentFixture<UpdateStatusFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateStatusFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateStatusFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
