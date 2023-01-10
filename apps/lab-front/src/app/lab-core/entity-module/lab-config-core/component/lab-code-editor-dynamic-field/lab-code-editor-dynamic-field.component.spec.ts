import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabCodeEditorDynamicFieldComponent} from './lab-code-editor-dynamic-field.component';

describe('LabPythonCodeDynamicFieldComponent', () => {
  let component: LabCodeEditorDynamicFieldComponent;
  let fixture: ComponentFixture<LabCodeEditorDynamicFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabCodeEditorDynamicFieldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabCodeEditorDynamicFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
