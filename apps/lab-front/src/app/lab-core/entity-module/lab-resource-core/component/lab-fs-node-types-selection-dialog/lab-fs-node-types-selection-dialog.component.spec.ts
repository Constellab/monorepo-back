import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabFsNodeTypesSelectionDialogComponent} from './lab-fs-node-types-selection-dialog.component';

describe('UploadFolderDialogComponent', () => {
  let component: LabFsNodeTypesSelectionDialogComponent;
  let fixture: ComponentFixture<LabFsNodeTypesSelectionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabFsNodeTypesSelectionDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabFsNodeTypesSelectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
