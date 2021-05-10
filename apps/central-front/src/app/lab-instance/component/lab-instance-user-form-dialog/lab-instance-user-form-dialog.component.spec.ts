import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabInstanceUserFormDialogComponent } from './lab-instance-user-form-dialog.component';

describe('LabInstanceUserFormDialogComponent', () => {
  let component: LabInstanceUserFormDialogComponent;
  let fixture: ComponentFixture<LabInstanceUserFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabInstanceUserFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabInstanceUserFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
