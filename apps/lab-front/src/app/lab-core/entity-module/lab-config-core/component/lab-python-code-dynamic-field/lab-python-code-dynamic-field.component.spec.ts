import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabPythonCodeDynamicFieldComponent} from './lab-python-code-dynamic-field.component';

describe('LabPythonCodeDynamicFieldComponent', () => {
  let component: LabPythonCodeDynamicFieldComponent;
  let fixture: ComponentFixture<LabPythonCodeDynamicFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabPythonCodeDynamicFieldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabPythonCodeDynamicFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
