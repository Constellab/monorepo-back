import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaAdminListPageFormDialogComponent } from './da-admin-list-page-form-dialog.component';

describe('DaAdminListPageFormDialogComponent', () => {
  let component: DaAdminListPageFormDialogComponent;
  let fixture: ComponentFixture<DaAdminListPageFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DaAdminListPageFormDialogComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DaAdminListPageFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
