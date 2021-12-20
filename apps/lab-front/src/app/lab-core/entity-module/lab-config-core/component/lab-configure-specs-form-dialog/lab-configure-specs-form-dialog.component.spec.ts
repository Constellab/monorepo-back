import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabConfigureSpecsFormDialogComponent} from './lab-configure-specs-form-dialog.component';

describe('BioxConfigureSpecDialogComponent', () => {
  let component: LabConfigureSpecsFormDialogComponent;
  let fixture: ComponentFixture<LabConfigureSpecsFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabConfigureSpecsFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabConfigureSpecsFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
