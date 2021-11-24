import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlTextEditorComponent } from './fl-text-editor.component';

describe('FlTextEditorComponent', () => {
  let component: FlTextEditorComponent;
  let fixture: ComponentFixture<FlTextEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlTextEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlTextEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
