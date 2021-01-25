import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlJsonEditorInputComponent} from './fl-json-editor-input.component';

describe('JsonEditorComponent', () => {
  let component: FlJsonEditorInputComponent;
  let fixture: ComponentFixture<FlJsonEditorInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlJsonEditorInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlJsonEditorInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
