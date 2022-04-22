import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlTextEditorTitleCaptionComponent} from './fl-text-editor-title-caption.component';

describe('FlTextEditorTitleCaptionComponent', () => {
  let component: FlTextEditorTitleCaptionComponent;
  let fixture: ComponentFixture<FlTextEditorTitleCaptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlTextEditorTitleCaptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlTextEditorTitleCaptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
