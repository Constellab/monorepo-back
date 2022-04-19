import {Injectable, OnDestroy} from '@angular/core';
import Quill from 'quill';
import {FlTextEditorUploadedImage} from '../model/fl-text-editor-image.class';
import {CmRichTextFigure} from '@monorepo/common-model';
import {BehaviorSubject, Observable} from 'rxjs';
import {FlTextEditorConfig} from '../model/fl-text-editor-config.class';


@Injectable()
export class FlTextEditorState implements OnDestroy {

  private quill: Quill;

  private disabled$: BehaviorSubject<boolean>;

  public config: FlTextEditorConfig;

  constructor() {
  }


  public init(quill: Quill, config: FlTextEditorConfig, disabled: boolean): void {
    this.quill = quill;
    this.config = config;
    this.disabled$ = new BehaviorSubject(disabled);
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

  public insertEmbed(index: number, type: string, value: any): void {
    this.quill.insertEmbed(index, type, value, Quill.sources.USER);
  }

  public getCurrentSelectionIndex(): number {
    return this.quill.getSelection(true).index;
  }

  //////////////////////////////////////// OTHER /////////////////////////////////

  public setDisabled(disabled: boolean): void {
    this.disabled$.next(disabled);
  }

  public getDisabled$(): Observable<boolean> {
    return this.disabled$.asObservable();
  }

  ngOnDestroy(): void {
    this.disabled$?.complete();
  }


}
