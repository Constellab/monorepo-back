import {Injectable, OnDestroy, Optional} from '@angular/core';
import Quill from 'quill';
import {FlTextEditorImageService, FlTextEditorUploadedImage} from '../fl-text-editor-image.service';
import {CmRichTextFigure} from '@monorepo/common-model';
import {BehaviorSubject, Observable} from 'rxjs';


@Injectable()
export class FlTextEditorState implements OnDestroy {

  private quill: Quill;

  private disabled$: BehaviorSubject<boolean>;

  constructor(@Optional() private imageService: FlTextEditorImageService) {
  }


  public init(quill: Quill, disabled: boolean): void {
    this.quill = quill;
    this.disabled$ = new BehaviorSubject(disabled);
  }


  public insertImageFromFile(file: File): void {
    if (!this.imageService) {
      console.error('[FlTextEditor] The FlTextEditorImageService was not provided');
      return;
    }

    console.log(file);

    this.imageService.uploadImage(file).subscribe(
      fileUrl => this.insertImageFromUrl(fileUrl, this.getCurrentSelectionIndex())
    );
  }

  public insertImageFromUrl(image: FlTextEditorUploadedImage, index: number): void {
    this.quill.insertEmbed(index, 'figure', {
      filename: image.filename,
      width: image.width,
      height: image.height,
      naturalWidth: image.width,
      naturalHeight: image.height
    } as CmRichTextFigure, Quill.sources.USER);
  }

  public getImageUrl(filename: string): string {
    if (!this.imageService) {
      console.error('[FlTextEditor] The FlTextEditorImageService was not provided');
      return '';
    }
    return this.imageService.getImageUrl(filename);
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
