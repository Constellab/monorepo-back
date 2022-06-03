import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlTextEditorLinkDialogComponent} from './fl-text-editor-link-dialog.component';

describe('FlTextEditorLinkDialogComponent', () => {
  let component: FlTextEditorLinkDialogComponent;
  let fixture: ComponentFixture<FlTextEditorLinkDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlTextEditorLinkDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlTextEditorLinkDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
