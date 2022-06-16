import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaPublicBrickVersionDetailDialogComponent } from './ha-public-brick-version-detail-dialog.component';

describe('HaPublicBrickVersionDetailDialogComponent', () => {
  let component: HaPublicBrickVersionDetailDialogComponent;
  let fixture: ComponentFixture<HaPublicBrickVersionDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaPublicBrickVersionDetailDialogComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HaPublicBrickVersionDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
