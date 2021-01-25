import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlJsonEditorDialogComponent } from './fl-json-editor-dialog.component';

describe('FlJsonEditorDialogComponent', () => {
  let component: FlJsonEditorDialogComponent;
  let fixture: ComponentFixture<FlJsonEditorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlJsonEditorDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlJsonEditorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
