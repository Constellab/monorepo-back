import {Injectable, Optional} from '@angular/core';
import Quill from 'quill';
import {FlTextEditorImageService} from './fl-text-editor-image.service';
import {FlTextEditorImage} from './fl-text-editor-image.class';


@Injectable()
export class FlTextEditorState {

  private quill: Quill;

  constructor(@Optional() private imageService: FlTextEditorImageService) {
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

  public insertImageFromUrl(url: string, index: number): void {
    this.quill.insertEmbed(index, 'image', {
      alt: '',
      url: url
    } as FlTextEditorImage, Quill.sources.USER);
  }

  public insertCodeBlock(): void {
    this.quill.format('code-block', true)
  }

  public insertBlockQuote(): void {
    this.quill.format('blockquote', true)
  }

  private getCurrentSelectionIndex(): number {
    return this.quill.getSelection(true).index;
  }
}
