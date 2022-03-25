import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaProjectFormDialogComponent} from './ca-project-form-dialog.component';

describe('ProjectFormDialogComponent', () => {
  let component: CaProjectFormDialogComponent;
  let fixture: ComponentFixture<CaProjectFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaProjectFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaProjectFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
