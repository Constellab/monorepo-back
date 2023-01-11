import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlTextEditorFormulaComponent} from './fl-text-editor-formula.component';

describe('FlTextEditorFormulaComponent', () => {
  let component: FlTextEditorFormulaComponent;
  let fixture: ComponentFixture<FlTextEditorFormulaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlTextEditorFormulaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlTextEditorFormulaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
