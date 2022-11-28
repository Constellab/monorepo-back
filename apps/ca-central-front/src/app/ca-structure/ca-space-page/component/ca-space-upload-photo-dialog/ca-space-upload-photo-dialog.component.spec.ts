import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSpaceUploadPhotoDialogComponent} from './ca-space-upload-photo-dialog.component';

describe('CaSpaceUploadPhotoDialogComponent', () => {
  let component: CaSpaceUploadPhotoDialogComponent;
  let fixture: ComponentFixture<CaSpaceUploadPhotoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSpaceUploadPhotoDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaSpaceUploadPhotoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
