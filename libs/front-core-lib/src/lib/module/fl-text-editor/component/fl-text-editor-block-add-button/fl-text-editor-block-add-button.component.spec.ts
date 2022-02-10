import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlTextEditorBlockAddButtonComponent} from './fl-text-editor-block-add-button.component';

describe('FlTextEditorBlockAddButtonComponent', () => {
  let component: FlTextEditorBlockAddButtonComponent;
  let fixture: ComponentFixture<FlTextEditorBlockAddButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlTextEditorBlockAddButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlTextEditorBlockAddButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
