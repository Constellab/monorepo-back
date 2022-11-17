import {Directive, ElementRef, Inject, Input, OnDestroy, OnInit, SecurityContext, ViewChild} from '@angular/core';
import Quill from 'quill';

import {ScrollDispatcher} from '@angular/cdk/overlay';
import {DOCUMENT} from '@angular/common';
import {DomSanitizer} from '@angular/platform-browser';
import hljs from 'highlight.js/lib/core';
import {FlTextEditorState} from '../state/fl-text-editor.state';
import {FlTextEditorConfig} from '../model/fl-text-editor-config.class';
import {FlQuillJson} from '../model/fl-text-editor.class';
import {FlPortalService} from '../../fl-portal/service/fl-portal.service';
import {FlTextEditorsManagerState} from '../state/fl-text-editors-manager.state';
import {FlQuillSetup} from '../model/fl-quill-setup.class';
import {FlQuillDelta} from '../model/fl-quill-export.class';

type FlTextEditorMode = 'HTML' | 'JSON'

@Directive({
  selector: '[flTextEditor]',
  providers: [FlTextEditorState]
})
export class FlTextEditorDirective implements OnInit, OnDestroy {

  @Input() config: FlTextEditorConfig;
  @Input() mode: FlTextEditorMode = 'HTML';

  /**
   * If auto it finds the parent scrollable element (use cdkScrollable),
   * otherwise it uses the child .ql-editor as scrollable
   */
  @Input() scrollContainer: 'auto' | 'child' = 'auto'
  @Input() value: string | FlQuillJson;

  private quill: Quill;

  constructor(@Inject(DOCUMENT) private document: Document,
              private state: FlTextEditorState,
              private elementRef: ElementRef,
              private scrollDispatcher: ScrollDispatcher,
              private sanitizer: DomSanitizer,
              private portalService: FlPortalService,
              private managerState: FlTextEditorsManagerState) {
    managerState.registerTextEditor(elementRef.nativeElement, state);
  }

  ngOnInit(): void {
    this.elementRef.nativeElement.classList.add('ql-directive');
    this.elementRef.nativeElement.classList.add('text-editor');
    // create and configure quill
    this.quill = new Quill(this.elementRef.nativeElement,
      {
        theme: 'bubble',
        modules: {
          syntax: {
            highlight: (text: string) => hljs.highlight(text, {language: 'python'}).value
          }, // Include syntax module
          toolbar: this.config.getToolbarConfig()
        },
        placeholder: '',
        scrollingContainer: FlQuillSetup.getScrollingContainer(this.scrollContainer, this.scrollDispatcher,
          this.document.documentElement, this.elementRef),
        readOnly: true
      }
    );
    this.quill.clipboard.addMatcher('IMG', (node, delta) => FlQuillSetup.addMatcher(node, delta, this.state, this.config));
    this.quill.disable();
    this.state.init(this.quill, this.config, this.elementRef.nativeElement, true);

    if (this.mode === 'HTML') {
      this.quill.root.innerHTML = this.sanitizer.sanitize(SecurityContext.HTML, (this.value as string));
    } else {
      const delta = (this.value as FlQuillJson)?.ops != null ? new FlQuillDelta((this.value as FlQuillJson).ops) : [];
      this.quill.setContents(delta, 'silent');
      this.removeLastUselessElement();
    }
  }

  /***
   * Remove the last <p><br></p> element in the text editor
   * @private
   */
  private removeLastUselessElement(): void{
    const elements: any[] = this.quill.getContents().ops;
    const lastElement: any = elements[elements.length-1];
    if(lastElement.insert && lastElement.insert == '\n'){
      elements.pop();
      const editorElement: HTMLDivElement = this.elementRef.nativeElement.querySelector('.ql-editor');
      editorElement.removeChild(editorElement.childNodes[editorElement.childElementCount-1]);
    }

  }

  ngOnDestroy(): void {
    const editorElement: HTMLDivElement = this.elementRef.nativeElement.querySelector('.ql-editor');
    if(editorElement){
      this.managerState.unregisterTextEditor(editorElement);
    }
  }

  // retrieve the first parent that is scrollable
}
