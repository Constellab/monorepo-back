import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlCodeEditorComponent} from './fl-code-editor.component';

describe('LabPythonEditorComponent', () => {
  let component: FlCodeEditorComponent;
  let fixture: ComponentFixture<FlCodeEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ FlCodeEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlCodeEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
