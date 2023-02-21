import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceFormDialogComponent} from './ca-lab-instance-form-dialog.component';

describe('CaLabInstanceFormDialogComponent', () => {
  let component: CaLabInstanceFormDialogComponent;
  let fixture: ComponentFixture<CaLabInstanceFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceFormDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaLabInstanceFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
