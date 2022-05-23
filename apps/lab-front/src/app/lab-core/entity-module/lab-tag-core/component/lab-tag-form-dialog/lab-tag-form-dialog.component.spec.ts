import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabTagFormDialogComponent} from './lab-tag-form-dialog.component';

describe('LabTagFormDialogComponent', () => {
  let component: LabTagFormDialogComponent;
  let fixture: ComponentFixture<LabTagFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabTagFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabTagFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
