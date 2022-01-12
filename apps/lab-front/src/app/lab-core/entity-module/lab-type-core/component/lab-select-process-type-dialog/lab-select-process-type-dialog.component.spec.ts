import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabSelectProcessTypeDialogComponent} from './lab-select-process-type-dialog.component';

describe('LabSelectProcessTypeDialogComponent', () => {
  let component: LabSelectProcessTypeDialogComponent;
  let fixture: ComponentFixture<LabSelectProcessTypeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabSelectProcessTypeDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabSelectProcessTypeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
