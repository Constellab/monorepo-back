import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabConfigureViewerDialogComponent} from './lab-configure-viewer-dialog.component';

describe('LabConfigureViewTaskDialogComponent', () => {
  let component: LabConfigureViewerDialogComponent;
  let fixture: ComponentFixture<LabConfigureViewerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabConfigureViewerDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabConfigureViewerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
