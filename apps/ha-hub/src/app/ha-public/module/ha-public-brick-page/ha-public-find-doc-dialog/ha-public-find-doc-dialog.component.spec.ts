import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaPublicFindDocDialogComponent } from './ha-public-find-doc-dialog.component';

describe('HaPublicFindDocDialogComponent', () => {
  let component: HaPublicFindDocDialogComponent;
  let fixture: ComponentFixture<HaPublicFindDocDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaPublicFindDocDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HaPublicFindDocDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
