import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaPublicSidenavCreateFormDialogComponent } from './ha-public-sidenav-create-form-dialog.component';

describe('HaPublicSidenavFormDialogComponent', () => {
  let component: HaPublicSidenavCreateFormDialogComponent;
  let fixture: ComponentFixture<HaPublicSidenavCreateFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaPublicSidenavCreateFormDialogComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HaPublicSidenavCreateFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
