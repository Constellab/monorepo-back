import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlTextEditorFigureComponent} from './fl-text-editor-figure.component';

describe('FlTextEditorFigureComponent', () => {
  let component: FlTextEditorFigureComponent;
  let fixture: ComponentFixture<FlTextEditorFigureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlTextEditorFigureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlTextEditorFigureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
