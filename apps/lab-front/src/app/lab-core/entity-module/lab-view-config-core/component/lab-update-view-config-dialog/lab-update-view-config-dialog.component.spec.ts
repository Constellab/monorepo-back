import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabUpdateViewConfigDialogComponent} from './lab-update-view-config-dialog.component';

describe('LabUpdateViewConfigNameDialogComponent', () => {
  let component: LabUpdateViewConfigDialogComponent;
  let fixture: ComponentFixture<LabUpdateViewConfigDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabUpdateViewConfigDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabUpdateViewConfigDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
