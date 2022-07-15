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
import {FlQuillJson, FlTextEditorBlockAddButton} from '../../model/fl-text-editor.class';
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
import {FlTextEditorState} from '../../state/fl-text-editor.state';
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import Quill, {BoundsStatic, RangeStatic} from 'quill';
import {FlTextEditorsManagerState} from '../../state/fl-text-editors-manager.state';
import {FlTextEditorConfig} from '../../model/fl-text-editor-config.class';
import {FlQuillBlock, FlQuillDelta} from '../../model/fl-quill-export.class';
import {FlHtmlHelper} from '../../../../utils/fl-html.helper';
import {FlFileHelper} from '../../../../service/fl-file.helper';

hljs.registerLanguage('python', python);

/**
 * HTML --> Get HTML and generate HTML
 * JSON --> Get JSON as Delta and generate JSON
 */
type FlTextEditorMode = 'HTML' | 'JSON'


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

  @Input() config: FlTextEditorConfig;

  @Input() mode: FlTextEditorMode = 'HTML';

  @Input() placeholder: string;

  // if true the text editor is focused on creation
  @Input() autoFocus: boolean = false;

  /**
   * If auto it finds the parent scrollable element (use cdkScrollable),
   * otherwise it uses the child .ql-editor as scrollable
   */
  @Input() scrollContainer: 'auto' | 'child' = 'auto';

  @Output() textChange: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('editor', {static: true}) editorElement: ElementRef<HTMLElement>;

  private quill: Quill;

  private blockAddButtonOverlay?: FlOverlayRef;

  constructor(@Optional() @Self() ngControl: NgControl,
              private sanitizer: DomSanitizer,
              @Inject(DOCUMENT) private document: Document,
              private scrollDispatcher: ScrollDispatcher,
              private elementRef: ElementRef,
              private portalService: FlPortalService,
              private zone: NgZone,
              private state: FlTextEditorState,
              private managerState: FlTextEditorsManagerState) {
    super(ngControl);
    managerState.registerTextEditor(elementRef.nativeElement, state);
  }

  ngOnInit(): void {
    // create and configure quill
    this.quill = new Quill(this.editorElement.nativeElement,
      {
        theme: 'bubble',
        modules: {
          syntax: {
            highlight: (text: string) => hljs.highlight(text, {language: 'python'}).value
          }, // Include syntax module
          toolbar: this.config.getToolbarConfig(),
        },
        placeholder: this.placeholder,
        scrollingContainer: this.getScrollingContainer()
      }
    );
    this.quill.clipboard.addMatcher('IMG', (node, delta) => {
      const insertImage: any = delta.ops[0].insert;
      const imageData: string = insertImage.image;
      if (imageData.startsWith('http')) {
        delta.ops[0] = {
          insert: {
            figure: {
              filename: imageData,
              width: null,
              height: null,
              naturalWidth: null,
              naturalHeight: null,
              title: '',
              caption: ''
            }
          }
        }
        console.log(delta.ops)
      } else if (imageData.startsWith('data')) {
        const blob: Blob = FlFileHelper.convertBase64ToBlob(insertImage.image.split(',')[1], 'image/png');
        this.config.getAndSaveImage(blob, this.state);
        delta.ops = [];
      }
      return delta;
    });

    this.state.init(this.quill, this.config, this.editorElement.nativeElement, this.disabled);

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

  onDisableChange(disable: boolean): void {
    if (this.quill) {
      if (disable) {
        this.quill.disable();
      } else {
        this.quill.enable();
      }
    }
  }

  setDisabledState(isDisabled: boolean): void {
    this.state.setDisabled(isDisabled);
  }

  outsideClick(event: MouseEvent): void {
    // we consider all elements with parent marked as text-editor-overlay to be in the text editor element
    const parent = FlHtmlHelper.getParent(event.target as HTMLElement, {className: 'text-editor-overlay'});
    if (parent) return;
    this.state.outsideClick(event);
    this.blockAddButtonOverlay?.dispose();
  }

  ngOnDestroy(): void {
    this.closeBlockAddButtonOverlay();
    this.managerState.unregisterTextEditor(this.editorElement.nativeElement);
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
    const delta = json?.ops != null ? new FlQuillDelta(json.ops) : [];
    this.quill.setContents(delta);
  }

  private onEditorChange(changeEvent: 'text-change' | 'selection-change', obj: any): void {
    if (changeEvent === 'selection-change') {
      this.showAddButton(obj);
    }
  }

  private showAddButton(range: RangeStatic): void {
    const buttons = this.config.getBlockAddButtons(this.state);
    if (range == null || this.disabled || buttons.length === 0) return;

    this.zone.run(() => {

      this.closeBlockAddButtonOverlay();
      if (range.length === 0) {
        const scroll: any = this.quill.scroll;
        const [block] = scroll.descendant(FlQuillBlock, range.index);
        if (block != null && block.domNode.firstChild instanceof HTMLBRElement) {
          const lineBounds: BoundsStatic = this.quill.getBounds(range.index, range.length);
          this.showBlockAddButton(lineBounds, buttons);
        }
      }
    });
  }

  private showBlockAddButton(lineBounds: BoundsStatic, buttons: FlTextEditorBlockAddButton[]): void {
    const editorPosition = this.editorElement.nativeElement.getBoundingClientRect();
    const config = this.portalService.configureAbsolutePortal({
      top: (editorPosition.top + lineBounds.top - 7) + 'px',
      left: (editorPosition.left + lineBounds.left - 50) + 'px'
    }, {scrollStrategy: this.portalService.getCloseOnScrollStrategy()});
    this.blockAddButtonOverlay = this.portalService.createPortal(FlTextEditorBlockAddButtonComponent, config, buttons);
  }

  private closeBlockAddButtonOverlay(): void {
    this.blockAddButtonOverlay?.dispose();
  }

  // retrieve the first parent that is scrollable
  private getScrollingContainer(): HTMLElement | string {
    if (this.scrollContainer === 'child') {
      return '.ql-editor';
    }

    // retrieve scrollable parents
    const scrollableElements = this.scrollDispatcher.getAncestorScrollContainers(this.elementRef);
    // if there are some scrollable parent, use the first one
    if (scrollableElements.length > 0) {
      return scrollableElements[scrollableElements.length - 1].getElementRef().nativeElement;
    }

    // otherwise, use document as scrolling container
    return this.document.documentElement;
  }
}
