import {Injectable, Optional} from '@angular/core';
import Quill from 'quill';
import {FlTextEditorImageService, FlTextEditorUploadedImage} from './fl-text-editor-image.service';
import {FlTextEditorFigure} from './fl-text-editor-image.class';
import {FlHtmlHelper} from '../../utils/fl-html.helper';


@Injectable()
export class FlTextEditorState {

  private quill: Quill;

  constructor(@Optional() private imageService: FlTextEditorImageService) {
  }

  /**
   * retrieve the fl-text-editor html element to check whether is has disabled attribute
   * @param element child element of text-editor
   */
  public static isDisable(element: HTMLElement): boolean {
    const textEditor = FlHtmlHelper.getParent(element, {tag: 'fl-text-editor'});

    return textEditor?.getAttribute('ng-reflect-disabled') === 'true' ?? false;
  }


  public init(quill: Quill): void {
    this.quill = quill;
  }


  public insertImageFromFile(file: File): void {
    if (!this.imageService) {
      console.error('[FlTextEditor] The FlTextEditorImageService was not provided');
    }

    this.imageService.uploadImage(file).subscribe(
      fileUrl => this.insertImageFromUrl(fileUrl, this.getCurrentSelectionIndex())
    );
  }

  public insertImageFromUrl(image: FlTextEditorUploadedImage, index: number): void {
    this.quill.insertEmbed(index, 'figure', {
      alt: '',
      url: image.url,
      width: image.width,
      height: image.height,
      naturalWidth: image.width,
      naturalHeight: image.height
    } as FlTextEditorFigure, Quill.sources.USER);
  }

  public insertCodeBlock(): void {
    this.quill.format('code-block', true);
  }

  public insertBlockQuote(): void {
    this.quill.format('blockquote', true);
  }

  private getCurrentSelectionIndex(): number {
    return this.quill.getSelection(true).index;
  }
}
