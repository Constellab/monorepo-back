import {Component, EventEmitter, Input, OnInit, Optional, Output, Self, ViewChild} from '@angular/core';
import {NgControl, Validator} from '@angular/forms';
import {FlJsonEditorConfig} from '../fl-json-editor-config.class';
import {ValidationErrors} from '@ngneat/reactive-forms/lib/types';
import {ClHelpService} from '@monorepo/core-lib';
import {FlFormFieldDirective} from '../../../abstract-directive/fl-form-field.directive';
import {FlTranslateService} from '../../fl-translate/service/fl-translate.service';
import {FlSnackBarService} from '../../fl-snack-bar/fl-snack-bar.service';
import {FlDropFileEvent} from '../../fl-core-directive/fl-drag-hover/fl-drop-file-event.class';
import {FlJsonEditorDirective} from '../fl-json-editor.directive';

/**
 * NgModel component for json editor. It uses the package jsoneditor
 * Code based on https://github.com/mariohmol/ang-jsoneditor/blob/master/ang-jsoneditor/src/jsoneditor/jsoneditor.component.ts
 *
 * It take a json string a Input/Output and handle an object internally
 *
 * Possibility to drop a json file on the component to load json
 */
@Component({
  selector: 'fl-json-editor-input',
  templateUrl: './fl-json-editor-input.component.html',
  styleUrls: ['./fl-json-editor-input.component.scss'],
  providers: [
    {provide: FlFormFieldDirective, useExisting: FlJsonEditorInputComponent},
  ]
})
export class FlJsonEditorInputComponent extends FlFormFieldDirective<any, string>
  implements OnInit, Validator {

  @Input() placeholder: string;

  @Input() config: Partial<FlJsonEditorConfig> = {};

  /**
   * If provided, the json is checked based on the schema
   * and set error {invalidJsonSchema: true} in the control if the json is invalid
   */
  @Input() jsonSchema: Record<string, unknown>;

  @Output() jsonChange: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild(FlJsonEditorDirective, {static: true}) jsonEditorDirective: FlJsonEditorDirective;

  constructor(@Optional() @Self() ngControl: NgControl,
              private translateService: FlTranslateService,
              private snackBarService: FlSnackBarService) {
    super(ngControl);
  }


  ngOnInit(): void {
    this.registerValidateMethod();
  }

  writeValue(value: string): void {
    const innerValue = this.convertOuterToInner(value);

    this.value = innerValue;
    this.setEditorValue(innerValue);
  }

  // set the json value in the json editor
  private setEditorValue(value: any): void {
    if (this.jsonEditorDirective.editor) {
      this.jsonEditorDirective.editor.set(value);
    }
  }

  onEditorChange(value: any): void {
    try {
      this.setAndEmitValue(value);
    } catch (e) {
      if (this.value != null) {
        this.setAndEmitValue(null);
      }
    }

  }

  validate(): ValidationErrors | null {
    if (this.jsonSchema) {
      return this.editorJsonIsValid() ? null : {invalidJsonSchema: true};

    }
    // no validation check
    return null;
  }


  // return the list of error of the json editor
  private editorJsonIsValid(): boolean {
    return (this.jsonEditorDirective.editor as any)?.validateSchema(this.value) ?? false;
  }

  // not use on code mode
  // onEditorChangeJSON(): void {
  //   if (this.editor) {
  //     try {
  //       this.jsonChange.emit(this.editor.get());
  //     } catch (e) {
  //       if (this.debug) {
  //         console.log(e);
  //       }
  //     }
  //   }
  // }


  callChangeEvent(value: string): void {
    this.jsonChange.emit(value);
  }

  protected convertOuterToInner(outerValue: string): any {
    if (ClHelpService.isNullOrEmpty(outerValue)) {
      return null;
    }
    try {
      return JSON.parse(outerValue);
    } catch (e) {
      console.error('Error during json parsing ', outerValue);
      return null;
    }
  }

  protected convertInnerToOuter(innerValue: any): string {
    return innerValue != null ? JSON.stringify(innerValue) : null;
  }

  async onFileDrop(ev: FlDropFileEvent): Promise<void> {
    if (ev.files.length === 0) {
      return;
    }

    const file: File = ev.files[0];
    // convert the file text to json
    const json: any = this.convertOuterToInner(await file.text());

    if (json != null) {
      // change the editor value
      this.setEditorValue(json);
      // emit the new value
      this.setAndEmitValue(json);
    } else {
      this.snackBarService.openErrorMessage('invalid_json_file', true);
    }
  }

}
