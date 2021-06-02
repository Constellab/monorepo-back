import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxConfigureSpecsFormDialogComponent } from './biox-configure-specs-form-dialog.component';

describe('BioxConfigureSpecDialogComponent', () => {
  let component: BioxConfigureSpecsFormDialogComponent;
  let fixture: ComponentFixture<BioxConfigureSpecsFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxConfigureSpecsFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxConfigureSpecsFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
