import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabUploadFsNodeDialogComponent} from './lab-upload-fs-node-dialog.component';

describe('UploadFolderDialogComponent', () => {
  let component: LabUploadFsNodeDialogComponent;
  let fixture: ComponentFixture<LabUploadFsNodeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabUploadFsNodeDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabUploadFsNodeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
