import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceUserFormDialogComponent} from './ca-lab-instance-user-form-dialog.component';

describe('LabInstanceUserFormDialogComponent', () => {
  let component: CaLabInstanceUserFormDialogComponent;
  let fixture: ComponentFixture<CaLabInstanceUserFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceUserFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabInstanceUserFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
