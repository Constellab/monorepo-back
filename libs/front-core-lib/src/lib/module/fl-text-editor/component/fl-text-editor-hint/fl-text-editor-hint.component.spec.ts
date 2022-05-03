import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlTextEditorHintComponent} from './fl-text-editor-hint.component';

describe('FlTextEditorHintComponent', () => {
  let component: FlTextEditorHintComponent;
  let fixture: ComponentFixture<FlTextEditorHintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlTextEditorHintComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlTextEditorHintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
