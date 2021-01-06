import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabInstanceFormDialogComponent} from './lab-instance-form-dialog.component';

describe('LabInstanceFormDialogComponent', () => {
  let component: LabInstanceFormDialogComponent;
  let fixture: ComponentFixture<LabInstanceFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabInstanceFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabInstanceFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
