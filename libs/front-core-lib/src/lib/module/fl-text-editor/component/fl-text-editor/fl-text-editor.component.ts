import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
  SecurityContext,
  Self,
  ViewChild
} from '@angular/core';
import Quill from 'quill';
import {FlQuillConfig, FlQuillJson} from '../../fl-quill.class';
import {FlFormFieldDirective} from '../../../../abstract-directive/form/fl-form-field.directive';
import {NgControl} from '@angular/forms';
import {DomSanitizer} from '@angular/platform-browser';

/**
 * HTML --> Get HTML and generate HTML
 * JSON --> Get JSON as Delta and generate JSON
 */
type FlTextEditorMode = 'HTML' | 'JSON'

const Delta = Quill.import('delta');

/**
 * Rich text editor (currently using quill)
 *
 * It supports NgModels
 */
@Component({
  selector: 'fl-text-editor',
  templateUrl: './fl-text-editor.component.html',
  styleUrls: ['./fl-text-editor.component.scss']
})
export class FlTextEditorComponent extends FlFormFieldDirective<string> implements OnInit {

  @Input() config: any = FlQuillConfig.defaultToolbarConfig;

  @Input() mode: FlTextEditorMode;

  @Input() readonly: boolean = false;

  @Input() placeholder: string;

  @Output() textChange: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild('editor', {static: true}) editorElement: ElementRef<HTMLElement>;

  quill: Quill;

  constructor(@Optional() @Self() ngControl: NgControl,
              private sanitizer: DomSanitizer) {
    super(ngControl);
  }

  ngOnInit(): void {
    // create and configure quill
    this.quill = new Quill(this.editorElement.nativeElement,
      {
        theme: 'bubble',
        modules: {
          toolbar: FlQuillConfig.defaultToolbarConfig,
        },
        readOnly: this.readonly,
        placeholder: this.placeholder
      }
    );

    this.quill.on('text-change', () => {
      this.setAndEmitValue(this.getQuillValue());
    });

    // init the HTML with the value set
    this.setQuillValue(this.value);

    // init the disabled
    this.onDisableChange(this.disabled);
  }


  callChangeEvent(value: string): void {
    this.textChange.next(value);
  }


  writeValue(value: any): void {
    if (this.quill) {
      this.setQuillValue(value);
    }
    // if the quill editor does not exist only set the value
    this.value = value;
  }

  private setQuillValue(value: any): void {
    if (this.mode === 'HTML') {
      this.setHTML(value);
    } else {
      this.setJsonDelta(value);
    }
  }

  private getQuillValue(): any {
    if (this.mode === 'HTML') {
      return this.quill.root.innerHTML;
    } else {
      return this.quill.getContents();
    }
  }

  private setHTML(html: string): void {
    // sanitize the html to prevent xss and set inner html
    this.quill.root.innerHTML = this.sanitizer.sanitize(SecurityContext.HTML, html);
  }

  private setJsonDelta(json: FlQuillJson): void {
    const delta = json?.ops != null ? new Delta(json.ops) : [];
    this.quill.setContents(delta);
  }

  onDisableChange(disable: boolean): void {
    if (this.quill) {
      if (disable) {
        this.quill.disable();
      } else {
        this.quill.enable();
      }
    }
  }


}
