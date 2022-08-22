import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabValidateObjectDialogComponent} from './lab-validate-object-dialog.component';

describe('LabValidateObjectComponent', () => {
  let component: LabValidateObjectDialogComponent;
  let fixture: ComponentFixture<LabValidateObjectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabValidateObjectDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabValidateObjectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
