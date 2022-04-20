import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabSelectViewConfigDialogComponent} from './lab-select-view-config-dialog.component';

describe('LabSelectViewConfigDialogComponent', () => {
  let component: LabSelectViewConfigDialogComponent;
  let fixture: ComponentFixture<LabSelectViewConfigDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabSelectViewConfigDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabSelectViewConfigDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
