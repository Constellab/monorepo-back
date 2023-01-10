import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabCodeEditorComponent} from './lab-code-editor.component';

describe('LabPythonEditorComponent', () => {
  let component: LabCodeEditorComponent;
  let fixture: ComponentFixture<LabCodeEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ LabCodeEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabCodeEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
