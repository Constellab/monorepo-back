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
import {FlQuillConfig} from '../../fl-quill-config';
import {FlFormFieldDirective} from '../../../../abstract-directive/form/fl-form-field.directive';
import {NgControl} from '@angular/forms';
import {DomSanitizer} from '@angular/platform-browser';

/**
 * Rich text editor (currently using quill)
 *
 * It support NgModels
 */
@Component({
  selector: 'fl-text-editor',
  templateUrl: './fl-text-editor.component.html',
  styleUrls: ['./fl-text-editor.component.scss']
})
export class FlTextEditorComponent extends FlFormFieldDirective<string> implements OnInit {


  @Input() config: any = FlQuillConfig.defaultToolbarConfig;
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
          toolbar: FlQuillConfig.defaultToolbarConfig
        }
      }
    );

    this.quill.on('text-change', () => {
      this.setAndEmitValue(this.quill.root.innerHTML);
    });

    // init the HTML with the value set
    this.setHTML(this.value);

    // init the disable
    this.onDisableChange(this.disabled);
  }


  callChangeEvent(value: string): void {
    this.textChange.next(value);
  }


  writeValue(html: string): void {
    if (this.quill) {
      this.setHTML(html);
    } else {
      // if the quill editor does not exist only set the value
      this.value = html;
    }
  }

  private setHTML(html: string): void {
    // sanitize the html to prevent xss and set inner html
    this.quill.root.innerHTML = this.sanitizer.sanitize(SecurityContext.HTML, html);
    this.value = html;
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
