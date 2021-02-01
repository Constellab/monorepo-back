import {Component, Inject, OnInit} from '@angular/core';
import {FlJsonEditorConfig} from '../fl-json-editor-config.class';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface JsonEditorDialogInput {
  // dialog title
  title: string;
  // json initial value
  value: any;
  // configuration for the json editor
  config: FlJsonEditorConfig;
  // json schema for the editor
  jsonSchema: Record<string, unknown>
}

@Component({
  selector: 'fl-json-editor-dialog',
  templateUrl: './fl-json-editor-dialog.component.html',
  styleUrls: ['./fl-json-editor-dialog.component.scss']
})
export class FlJsonEditorDialogComponent implements OnInit {

  input: JsonEditorDialogInput;

  constructor(@Inject(MAT_DIALOG_DATA) dialogInput: JsonEditorDialogInput) {
    this.input = dialogInput;
  }

  ngOnInit(): void {
  }

}
