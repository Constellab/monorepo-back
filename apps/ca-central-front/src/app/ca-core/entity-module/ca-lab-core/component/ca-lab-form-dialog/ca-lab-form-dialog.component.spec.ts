import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabFormDialogComponent} from './ca-lab-form-dialog.component';

describe('LabFormDialogComponent', () => {
  let component: CaLabFormDialogComponent;
  let fixture: ComponentFixture<CaLabFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
