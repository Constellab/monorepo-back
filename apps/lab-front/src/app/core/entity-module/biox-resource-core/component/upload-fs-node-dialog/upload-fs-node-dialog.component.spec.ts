import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadFsNodeDialogComponent } from './upload-fs-node-dialog.component';

describe('UploadFolderDialogComponent', () => {
  let component: UploadFsNodeDialogComponent;
  let fixture: ComponentFixture<UploadFsNodeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadFsNodeDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadFsNodeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
