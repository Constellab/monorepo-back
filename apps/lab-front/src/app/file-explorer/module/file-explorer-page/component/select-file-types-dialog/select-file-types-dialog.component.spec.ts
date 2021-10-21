import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SelectFileTypesDialogComponent} from './select-file-types-dialog.component';

describe('SelectFileTypesDialogComponent', () => {
  let component: SelectFileTypesDialogComponent;
  let fixture: ComponentFixture<SelectFileTypesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectFileTypesDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectFileTypesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
