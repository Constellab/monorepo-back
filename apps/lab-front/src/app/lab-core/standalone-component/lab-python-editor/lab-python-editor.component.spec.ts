import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabPythonEditorComponent} from './lab-python-editor.component';

describe('LabPythonEditorComponent', () => {
  let component: LabPythonEditorComponent;
  let fixture: ComponentFixture<LabPythonEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ LabPythonEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabPythonEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
