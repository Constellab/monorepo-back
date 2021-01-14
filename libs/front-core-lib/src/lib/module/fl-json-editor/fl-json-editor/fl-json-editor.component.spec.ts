import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlJsonEditorComponent} from './fl-json-editor.component';

describe('JsonEditorComponent', () => {
  let component: FlJsonEditorComponent;
  let fixture: ComponentFixture<FlJsonEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlJsonEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlJsonEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
