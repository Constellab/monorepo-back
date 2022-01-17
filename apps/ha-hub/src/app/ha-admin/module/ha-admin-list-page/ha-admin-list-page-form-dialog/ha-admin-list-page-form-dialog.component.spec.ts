import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaAdminListPageFormDialogComponent } from './ha-admin-list-page-form-dialog.component';

describe('DaAdminListPageFormDialogComponent', () => {
  let component: HaAdminListPageFormDialogComponent;
  let fixture: ComponentFixture<HaAdminListPageFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaAdminListPageFormDialogComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HaAdminListPageFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
