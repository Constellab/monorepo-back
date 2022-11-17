import {Component, OnInit} from '@angular/core';
import {FlTextEditorSnowButton} from '../../model/fl-text-editor.class';
import {FlTextEditorState} from '../../state/fl-text-editor.state';

@Component({
  selector: 'fl-text-editor-snow-button',
  templateUrl: './fl-text-editor-snow-button.component.html',
  styleUrls: ['./fl-text-editor-snow-button.component.scss']
})
export class FlTextEditorSnowButtonComponent implements OnInit {

  buttons: FlTextEditorSnowButton[];

  constructor(private state: FlTextEditorState) {
  }

  ngOnInit(): void {
    this.buttons = this.state.config.getSnowButtons();
  }

  onAction(button: FlTextEditorSnowButton, event: any): void {
    if (!button.onAction) return;
    button.onAction(event, this.state);
  }
}
