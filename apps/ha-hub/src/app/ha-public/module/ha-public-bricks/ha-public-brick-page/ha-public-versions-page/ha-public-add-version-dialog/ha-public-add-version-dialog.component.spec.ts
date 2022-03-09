import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaPublicAddVersionDialogComponent } from './ha-public-add-version-dialog.component';

describe('HaPublicAddVersionDialogComponent', () => {
  let component: HaPublicAddVersionDialogComponent;
  let fixture: ComponentFixture<HaPublicAddVersionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaPublicAddVersionDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HaPublicAddVersionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
