import {OnDestroy, Pipe, PipeTransform} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

/**
 * Pipe to convert a blob to display and use it in image src
 */
@Pipe({
  name: 'flBlobToSrc'
})
export class FlBlobToSrcPipe implements PipeTransform, OnDestroy {

  private lastUrl: string;

  constructor(private sanitizer: DomSanitizer) {
  }


  transform(blob: Blob): SafeResourceUrl {
    this.revokeLastURL();

    if (blob == null) {
      return '';
    }

    this.lastUrl = URL.createObjectURL(blob);
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.lastUrl);
  }

  ngOnDestroy(): void {
    this.revokeLastURL();
  }

  private revokeLastURL(): void {
    if (this.lastUrl) {
      URL.revokeObjectURL(this.lastUrl);
      this.lastUrl = null;
    }
  }


}
