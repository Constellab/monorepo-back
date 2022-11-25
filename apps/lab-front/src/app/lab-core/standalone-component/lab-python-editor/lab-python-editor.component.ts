import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EditorState} from '@codemirror/state';
import {EditorView, keymap} from '@codemirror/view';
import {python} from '@codemirror/lang-python';
import {basicSetup} from 'codemirror';
import {defaultKeymap, indentWithTab} from '@codemirror/commands';
import {FormControl} from '@angular/forms';
import {FlThemeService} from '@monorepo/front-core-lib';

/**
 * Python IDE editor component using CodeMirror.
 * This component is standalone and is dynamically import to have it own bundle that
 * is only loaded when needed.
 */
@Component({
  selector: 'lab-python-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lab-python-editor.component.html',
  styleUrls: ['./lab-python-editor.component.scss']
})
export class LabPythonEditorComponent implements OnInit, OnDestroy {

  @Input() formCtrl: FormControl;

  @ViewChild('editor', {static: true}) editor: ElementRef<HTMLElement>;


  private editorState: EditorState;
  private editorView: EditorView;

  constructor(private themeService: FlThemeService) {
  }

  ngOnInit(): void {
    this.editorState = EditorState.create({
      doc: this.formCtrl.getRawValue(),
      extensions: [
        keymap.of([...defaultKeymap, indentWithTab]),
        basicSetup,
        python(),
        // use to update the form control value when text changes
        EditorView.updateListener.of((update) => {
          this.formCtrl.patchValue(update.state.doc.toString());
        }),
        EditorView.darkTheme.of(this.themeService.isDarkTheme())
      ],
    });

    this.editorView = new EditorView({
      state: this.editorState,
      parent: this.editor.nativeElement,
    });

    // EditorView.theme()
  }


  ngOnDestroy(): void {
    this.editorView.destroy();
  }


}
