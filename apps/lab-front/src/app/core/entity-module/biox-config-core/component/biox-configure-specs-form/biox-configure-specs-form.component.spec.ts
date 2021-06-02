import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxConfigureSpecsFormComponent } from './biox-configure-specs-form.component';

describe('BioxConfigureSpecComponent', () => {
  let component: BioxConfigureSpecsFormComponent;
  let fixture: ComponentFixture<BioxConfigureSpecsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxConfigureSpecsFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxConfigureSpecsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
