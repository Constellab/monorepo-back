import {Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {flDefaultJsonEditorConfig, FlJsonEditorConfig} from './fl-json-editor-config.class';
import JSONEditor, {JSONEditorOptions} from 'jsoneditor';
import {FlTranslateService} from '../fl-translate/service/fl-translate.service';

/**
 * Directive to setup the json editor on an HTML element
 * Code based on https://github.com/mariohmol/ang-jsoneditor/blob/master/ang-jsoneditor/src/jsoneditor/jsoneditor.component.ts
 */
@Directive({
  selector: '[flJsonEditor]'
})
export class FlJsonEditorDirective implements OnInit, OnDestroy {

  /**
   * Init the value of the editor
   */
  @Input('flJsonEditor') value: any;

  @Input('flJsonEditorConfig') config: Partial<FlJsonEditorConfig> = {};

  /**
   * If provided, the json is checked based on the schema
   */
  @Input('flJsonEditorSchema') jsonSchema: Record<string, unknown>;

  @Output() flJsonChange: EventEmitter<any> = new EventEmitter<any>();

  public editor: JSONEditor;

  constructor(private elementRef: ElementRef<HTMLElement>,
              private translateService: FlTranslateService) {
  }

  ngOnInit(): void {
    this.initEditor();
  }

  private initEditor(): void {
    const options: JSONEditorOptions = Object.assign(flDefaultJsonEditorConfig, this.config);

    // set the correct language
    options.language = this.translateService.getUserLanguage();

    // not used on code mode
    // if (!options.onChangeJSON && this.jsonChange) {
    //   options.onChangeJSON = this.onEditorChangeJSON.bind(this);
    // }
    options.onChange = this.onEditorChange.bind(this);

    if (!this.elementRef.nativeElement) {
      console.error(`Can't find the ElementRef reference for json editor)`);
    }

    if (this.jsonSchema) {
      options.schema = this.jsonSchema;
    }

    this.editor = new JSONEditor(this.elementRef.nativeElement, options, this.value);
  }

  onEditorChange(): void {
    if (this.editor) {
      try {
        this.flJsonChange.emit(this.editor.get());
      } catch (e) {
        if (this.value != null) {
          this.flJsonChange.emit(null);
        }
      }

    }
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }


}
