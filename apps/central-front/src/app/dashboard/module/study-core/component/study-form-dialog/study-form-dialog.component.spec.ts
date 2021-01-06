import {ComponentFixture, TestBed} from '@angular/core/testing';

import {StudyFormDialogComponent} from './study-form-dialog.component';

describe('StudyFormDialogComponent', () => {
  let component: StudyFormDialogComponent;
  let fixture: ComponentFixture<StudyFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudyFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
