import {Injectable, OnDestroy} from '@angular/core';
import Quill, {RangeStatic} from 'quill';
import {FlTextEditorUploadedImage} from '../model/fl-text-editor-image.class';
import {CmRichTextFigure, CmRichTextVideo} from '@monorepo/common-model';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {FlTextEditorConfig} from '../model/fl-text-editor-config.class';
import {FlTextEditorHintType} from '../model/fl-text-editor-hint-blot.class';
import {ClYoutubeHelper} from '@monorepo/core-lib';

@Injectable()
export class FlTextEditorState implements OnDestroy {

  public textEditorContainer: HTMLElement;

  private quill: Quill;

  private disabled$: BehaviorSubject<boolean>;
  private outsideClick$: Subject<MouseEvent>;

  public config: FlTextEditorConfig;

  constructor() {
  }


  public init(quill: Quill, config: FlTextEditorConfig, textEditorContainer: HTMLElement, disabled: boolean): void {
    this.quill = quill;
    this.config = config;
    this.textEditorContainer = textEditorContainer;
    this.disabled$ = new BehaviorSubject(disabled);
    this.outsideClick$ = new Subject();
  }


  public insertImageFromUrl(image: FlTextEditorUploadedImage, index: number): void {
    const figure: CmRichTextFigure = {
      filename: image.filename,
      width: image.width,
      height: image.height,
      naturalWidth: image.width,
      naturalHeight: image.height
    };
    this.insertEmbed(index, 'figure', figure);
  }

  public insertCodeBlock(): void {
    this.quill.format('code-block', true);
  }

  public insertBlockQuote(): void {
    this.quill.format('blockquote', true);
  }

  public insertHint(hintType: FlTextEditorHintType): void {
    this.quill.format('hint', hintType);
  }

  public insertVideo(url: string, index: number): void {
    const embedUrl = ClYoutubeHelper.convertToEmbedUrl(url);
    if(embedUrl == null) return;

    const data: CmRichTextVideo = {
      url: embedUrl,
      title: '',
      caption: ''
    };
    this.insertEmbed(index, 'video', data);
  }

  public insertLink(index: number, link: string, linkName: string): void{
    this.quill.insertText(index, linkName, 'link', link, Quill.sources.USER);
  }


  public insertEmbed(index: number, type: string, value: any): void {
    this.quill.insertEmbed(index, type, value, Quill.sources.USER);
  }

  public removeFormat(): void {
    const selection = this.getCurrentSelection();
    this.quill.removeFormat(selection.index, selection.length);
  }

  public getCurrentSelection(): RangeStatic {
    return this.quill.getSelection(true);
  }


  public getCurrentSelectionIndex(): number {
    return this.getCurrentSelection().index;
  }


  //////////////////////////////////////// ELEMENT MANIP /////////////////////////////////

  /**
   * Return the block element of an element in the text editor
   * @param element
   * @private
   */
  public getEditorBlockElement(element: HTMLElement): HTMLElement {
    let target: HTMLElement = element;
    let previousTarget: HTMLElement = null;

    const editorElement = this.getQlEditorElement();

    while (target != null && target !== editorElement) {
      previousTarget = target;
      target = target.parentElement;
    }

    return previousTarget;
  }

  /**
   * Retrieve the text editor block from an page y position
   * @param pageY
   */
  public getBlockFromMouseYPosition(pageY: number): HTMLElement {
    const editor = this.getQlEditorElement();

    let previousChild: HTMLElement = null;
    for (let i = 0; i < editor.childNodes.length; i++) {
      const child: HTMLElement = editor.childNodes[i] as HTMLElement;
      const rect = child.getBoundingClientRect();

      // when the top of the rect is greater (meaning bellow the mouse), we stop and return the previous child
      if (rect.top > pageY) {
        return previousChild;
      }
      previousChild = child;
    }

    return null;
  }

  /**
   * return true if the element is an empty block in the text editor
   * @param element
   * @private
   */
  public isEmptyBlock(element: HTMLElement): boolean {
    return element.children.length === 1 && (element.childNodes[0] as HTMLElement).tagName === 'BR';
  }

  public getQlEditorElement(): HTMLElement {
    return this.textEditorContainer.querySelector('.ql-editor');
  }


  //////////////////////////////////////// OTHER /////////////////////////////////

  public setDisabled(disabled: boolean): void {
    this.disabled$.next(disabled);
  }

  public getDisabled$(): Observable<boolean> {
    return this.disabled$.asObservable();
  }

  public outsideClick(event: MouseEvent): void{
    this.outsideClick$.next(event);
  }

  public getOutsideClick$(): Observable<MouseEvent> {
    return this.outsideClick$.asObservable();
  }

  ngOnDestroy(): void {
    this.disabled$?.complete();
    this.outsideClick$?.complete();
  }


}
