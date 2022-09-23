import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaUserProfileEditDialogComponent } from './ca-user-profile-edit-dialog.component';

describe('CaUserProfileEditDialogComponent', () => {
  let component: CaUserProfileEditDialogComponent;
  let fixture: ComponentFixture<CaUserProfileEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaUserProfileEditDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaUserProfileEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
