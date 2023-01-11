import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlTextEditorFormulaDialogComponent} from './fl-text-editor-formula-dialog.component';

describe('FlTextEditorFormulaDialogComponent', () => {
  let component: FlTextEditorFormulaDialogComponent;
  let fixture: ComponentFixture<FlTextEditorFormulaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlTextEditorFormulaDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlTextEditorFormulaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
