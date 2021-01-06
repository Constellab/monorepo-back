import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabFormDialogComponent} from './lab-form-dialog.component';

describe('LabFormDialogComponent', () => {
  let component: LabFormDialogComponent;
  let fixture: ComponentFixture<LabFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
