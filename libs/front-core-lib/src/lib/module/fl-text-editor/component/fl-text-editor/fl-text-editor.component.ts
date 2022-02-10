import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  SecurityContext,
  Self,
  ViewChild
} from '@angular/core';
import {FlQuillConfig, FlQuillJson} from '../../fl-quill.class';
import {FlFormFieldDirective} from '../../../../abstract-directive/form/fl-form-field.directive';
import {NgControl} from '@angular/forms';
import {DomSanitizer} from '@angular/platform-browser';
import {DOCUMENT} from '@angular/common';
import {ScrollDispatcher} from '@angular/cdk/overlay';
import {FlPortalService} from '../../../fl-portal/service/fl-portal.service';
import {FlOverlayRef} from '../../../fl-portal/model/fl-overlay-ref.class';
import {
  FlTextEditorBlockAddButtonComponent
} from '../fl-text-editor-block-add-button/fl-text-editor-block-add-button.component';
import {FlTextEditorState} from '../../fl-text-editor.state';
import {FlTextEditorImageBlot} from '../../fl-text-editor-image.class';
import hljs from 'highlight.js';
import python from 'highlight.js/lib/languages/python';
import Quill, {BoundsStatic, RangeStatic} from 'quill';

hljs.registerLanguage('python', python);
/**
 * HTML --> Get HTML and generate HTML
 * JSON --> Get JSON as Delta and generate JSON
 */
type FlTextEditorMode = 'HTML' | 'JSON'

const Delta = Quill.import('delta');
const Block = Quill.import('blots/block');

Quill.register(FlTextEditorImageBlot, true);


/**
 * Rich text editor (currently using quill)
 *
 * It supports NgModels
 */
@Component({
  selector: 'fl-text-editor',
  templateUrl: './fl-text-editor.component.html',
  styleUrls: ['./fl-text-editor.component.scss'],
  providers: [FlTextEditorState]
})
export class FlTextEditorComponent extends FlFormFieldDirective<string> implements OnInit, OnDestroy {

  @Input() config: any = FlQuillConfig.defaultToolbarConfig;

  @Input() mode: FlTextEditorMode = 'HTML';

  @Input() placeholder: string;

  // if true the text editor is focused on creation
  @Input() autoFocus: boolean = false;

  @Output() textChange: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('editor', {static: true}) editorElement: ElementRef<HTMLElement>;

  quill: Quill;

  private blockAddButtonOverlay?: FlOverlayRef;

  constructor(@Optional() @Self() ngControl: NgControl,
              private sanitizer: DomSanitizer,
              @Inject(DOCUMENT) private document: Document,
              private scrollDispatcher: ScrollDispatcher,
              private elementRef: ElementRef,
              private portalService: FlPortalService,
              private zone: NgZone,
              private state: FlTextEditorState) {
    super(ngControl);
  }

  ngOnInit(): void {
    const a = hljs;
    // create and configure quill
    this.quill = new Quill(this.editorElement.nativeElement,
      {
        theme: 'bubble',
        modules: {
          syntax: {
            highlight: (text: string) => hljs.highlight( text, {language: 'python'}).value
          },              // Include syntax module
          toolbar: FlQuillConfig.defaultToolbarConfig,
        },
        placeholder: this.placeholder,
        scrollingContainer: this.getScrollingContainer()
      }
    );

    this.state.init(this.quill);


    // init the HTML with the value set
    this.setQuillValue(this.value);

    // init the disabled
    this.onDisableChange(this.disabled);

    if (this.autoFocus && !this.disabled) {
      this.quill.focus();
    }

    // use setTimeout prevent text-change on init value
    setTimeout(() => {
      this.quill.on('text-change', () => this.setAndEmitValue(this.getQuillValue()));
    }, 0);

    this.quill.on('editor-change', (changeEvent: any, obj: any) => this.onEditorChange(changeEvent, obj));
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

  // retrieve the first parent that is scrollable
  private getScrollingContainer(): HTMLElement {
    // retrieve scrollable parents
    const scrollableElements = this.scrollDispatcher.getAncestorScrollContainers(this.elementRef);
    // if there are some scrollable parent, use the first one
    if (scrollableElements.length > 0) {
      return scrollableElements[scrollableElements.length - 1].getElementRef().nativeElement;
    }

    // otherwise, use document as scrolling container
    return this.document.documentElement;
  }

  private onEditorChange(changeEvent: 'text-change' | 'selection-change', obj: any): void {
    if (changeEvent === 'selection-change') {
      this.onSelectionChange(obj);
    }
  }

  private onSelectionChange(range: RangeStatic): void {
    if (range == null) return;

    this.zone.run(() => {

      this.closeBlockAddButtonOverlay();
      if (range.length === 0) {
        const scroll: any = this.quill.scroll;
        const [block, offset] = scroll.descendant(Block, range.index);
        if (block != null && block.domNode.firstChild instanceof HTMLBRElement) {
          const lineBounds: BoundsStatic = this.quill.getBounds(range.index, range.length);
          this.showBlockAddButton(lineBounds);
          // this.quill.removeFormat(range.index, 0)
        }
      } else {
      }

    });
  }

  private showBlockAddButton(lineBounds: BoundsStatic): void {
    const editorPosition = this.editorElement.nativeElement.getBoundingClientRect();
    const config = this.portalService.configureAbsolutePortal({
      top: (editorPosition.top + lineBounds.top - 7) + 'px',
      left: (editorPosition.left + lineBounds.left - 50) + 'px'
    }, {
      customProviders: [{provide: FlTextEditorState, useValue: this.state}]
    });

    this.blockAddButtonOverlay = this.portalService.createPortal(FlTextEditorBlockAddButtonComponent, config);
  }

  private closeBlockAddButtonOverlay(): void {
    this.blockAddButtonOverlay?.dispose();
  }

  ngOnDestroy(): void {
    this.closeBlockAddButtonOverlay();
  }
}
