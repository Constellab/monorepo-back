import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceAdminFormDialogComponent} from './ca-lab-instance-admin-form-dialog.component';

describe('LabInstanceFormDialogComponent', () => {
  let component: CaLabInstanceAdminFormDialogComponent;
  let fixture: ComponentFixture<CaLabInstanceAdminFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceAdminFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabInstanceAdminFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
