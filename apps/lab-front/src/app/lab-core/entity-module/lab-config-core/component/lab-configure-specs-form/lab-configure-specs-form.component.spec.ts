import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabConfigureSpecsFormComponent} from './lab-configure-specs-form.component';

describe('BioxConfigureSpecComponent', () => {
  let component: LabConfigureSpecsFormComponent;
  let fixture: ComponentFixture<LabConfigureSpecsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabConfigureSpecsFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabConfigureSpecsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
