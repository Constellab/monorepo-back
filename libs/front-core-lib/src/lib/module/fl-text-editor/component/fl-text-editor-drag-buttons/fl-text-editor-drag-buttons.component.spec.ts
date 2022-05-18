import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlTextEditorDragButtonsComponent} from './fl-text-editor-drag-buttons.component';

describe('FlTextEditorDragButtonsComponent', () => {
  let component: FlTextEditorDragButtonsComponent;
  let fixture: ComponentFixture<FlTextEditorDragButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlTextEditorDragButtonsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlTextEditorDragButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
