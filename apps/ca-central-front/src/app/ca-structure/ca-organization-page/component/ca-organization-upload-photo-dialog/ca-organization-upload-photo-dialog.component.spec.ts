import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaOrganizationUploadPhotoDialogComponent} from './ca-organization-upload-photo-dialog.component';

describe('CaOrganizationUploadPhotoDialogComponent', () => {
  let component: CaOrganizationUploadPhotoDialogComponent;
  let fixture: ComponentFixture<CaOrganizationUploadPhotoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaOrganizationUploadPhotoDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaOrganizationUploadPhotoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
