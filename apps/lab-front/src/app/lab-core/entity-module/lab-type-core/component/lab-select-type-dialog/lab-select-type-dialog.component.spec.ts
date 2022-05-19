import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabSelectTypeDialogComponent} from './lab-select-type-dialog.component';

describe('LabSelectProcessTypeDialogComponent', () => {
  let component: LabSelectTypeDialogComponent;
  let fixture: ComponentFixture<LabSelectTypeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabSelectTypeDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabSelectTypeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
