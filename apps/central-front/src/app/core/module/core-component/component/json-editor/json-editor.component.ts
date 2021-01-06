import {Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Optional, Output, Self, ViewChild} from '@angular/core';
import {NgControl, Validator} from '@angular/forms';
import {defaultJsonEditorConfig, JsonEditorConfig} from './json-editor-option.class';
import {FormFieldDirective} from '../../../../abstract-directive/form-field.directive';
import JSONEditor, {JSONEditorOptions} from 'jsoneditor';
import {CoreTranslateService} from '../../../translate/service/core-translate.service';
import {HelpService} from '../../../../utils/help-service';
import {DropFileEvent} from '../../../core-directive/drag-hover/drop-file-event.class';
import {SnackBarService} from '../../../../service/snack-bar.service';
import {AbstractControl} from '@ngneat/reactive-forms';
import {ValidationErrors} from '@ngneat/reactive-forms/lib/types';

/**
 * NgModel component for json editor. It uses the package jsoneditor
 * Code based on https://github.com/mariohmol/ang-jsoneditor/blob/master/ang-jsoneditor/src/jsoneditor/jsoneditor.component.ts
 *
 * It take a json string a Input/Output and handle an object internally
 *
 * Possibility to drop a json file on the component to load json
 */
@Component({
  selector: 'gen-json-editor',
  templateUrl: './json-editor.component.html',
  styleUrls: ['./json-editor.component.scss'],
  providers: [
    {provide: FormFieldDirective, useExisting: JsonEditorComponent},
  ]
})
export class JsonEditorComponent extends FormFieldDirective<any, string>
  implements OnInit, OnDestroy, Validator {

  @Input() placeholder: string;

  @Input() config: Partial<JsonEditorConfig> = {};

  /**
   * If provided, the json is checked based on the schema
   * and set error {invalidJsonSchema: true} in the control if the json is invalid
   */
  @Input() jsonSchema: object;

  @Output() jsonChange: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('jsonEditorContainer', {static: true}) jsonEditorContainer: ElementRef;
  private editor: JSONEditor;

  constructor(@Optional() @Self() ngControl: NgControl,
              private translateService: CoreTranslateService,
              private snackBarService: SnackBarService) {
    super(ngControl);
  }


  ngOnInit(): void {
    this.initEditor();
    this.registerValidateMethod();
  }

  private initEditor(): void {
    const options: JSONEditorOptions = Object.assign(defaultJsonEditorConfig, this.config);

    // set the correct language
    options.language = this.translateService.getUserLanguage();

    // not used on code mode
    // if (!options.onChangeJSON && this.jsonChange) {
    //   options.onChangeJSON = this.onEditorChangeJSON.bind(this);
    // }
    options.onChange = this.onEditorChange.bind(this);

    if (!this.jsonEditorContainer.nativeElement) {
      console.error(`Can't find the ElementRef reference for json editor)`);
    }

    if (this.jsonSchema) {
      options.schema = this.jsonSchema;
    }

    this.editor = new JSONEditor(this.jsonEditorContainer.nativeElement, options, this.value);
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  writeValue(value: string): void {
    const innerValue = this.convertOuterToInner(value);

    this.value = innerValue;
    this.setEditorValue(innerValue);
  }

  // set the json value in the json editor
  private setEditorValue(value: any): void {
    if (this.editor) {
      this.editor.set(value);
    }
  }

  onEditorChange(): void {
    if (this.editor) {
      try {
        this.setAndEmitValue(this.editor.get());
      } catch (e) {
        if (this.value != null) {
          this.setAndEmitValue(null);
        }
      }
    }
  }

  validate(control: AbstractControl<string>): ValidationErrors | null {
    if (this.jsonSchema) {
      return this.editorJsonIsValid() ? null : {invalidJsonSchema: true};

    }
    // no validation check
    return null;
  }


  // return the list of error of the json editor
  private editorJsonIsValid(): boolean {
    return (this.editor as any)?.validateSchema(this.value) ?? false;
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

  public destroy(): void {
    this.editor.destroy();
  }


  protected convertOuterToInner(outerValue: string): any {
    if (HelpService.isNullOrEmpty(outerValue)) {
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

  async onFileDrop(ev: DropFileEvent): Promise<void> {
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
