import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabImportResourceDialogComponent} from './lab-import-resource-dialog.component';

describe('BioxImportResourceDialogComponent', () => {
  let component: LabImportResourceDialogComponent;
  let fixture: ComponentFixture<LabImportResourceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabImportResourceDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabImportResourceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
