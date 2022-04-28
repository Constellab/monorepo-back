import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaPublicEditBrickDialogComponent } from './ha-public-edit-brick-dialog.component';

describe('HaPublicEditBrickDialogComponent', () => {
  let component: HaPublicEditBrickDialogComponent;
  let fixture: ComponentFixture<HaPublicEditBrickDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaPublicEditBrickDialogComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HaPublicEditBrickDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
