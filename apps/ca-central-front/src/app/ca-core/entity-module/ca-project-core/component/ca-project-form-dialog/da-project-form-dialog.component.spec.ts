import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DaProjectFormDialogComponent} from './da-project-form-dialog.component';

describe('ProjectFormDialogComponent', () => {
  let component: DaProjectFormDialogComponent;
  let fixture: ComponentFixture<DaProjectFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DaProjectFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DaProjectFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
