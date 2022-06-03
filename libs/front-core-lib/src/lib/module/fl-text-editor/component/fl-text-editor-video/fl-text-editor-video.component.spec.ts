import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlTextEditorVideoComponent} from './fl-text-editor-video.component';

describe('FlTextEditorVideoComponent', () => {
  let component: FlTextEditorVideoComponent;
  let fixture: ComponentFixture<FlTextEditorVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlTextEditorVideoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlTextEditorVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
