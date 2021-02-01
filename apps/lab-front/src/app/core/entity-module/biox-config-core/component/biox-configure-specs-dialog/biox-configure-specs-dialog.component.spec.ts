import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxConfigureSpecsDialogComponent } from './biox-configure-specs-dialog.component';

describe('BioxConfigureSpecDialogComponent', () => {
  let component: BioxConfigureSpecsDialogComponent;
  let fixture: ComponentFixture<BioxConfigureSpecsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxConfigureSpecsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxConfigureSpecsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
