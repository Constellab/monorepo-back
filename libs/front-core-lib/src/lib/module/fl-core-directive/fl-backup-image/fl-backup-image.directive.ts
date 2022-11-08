import {Directive, ElementRef, HostListener, Input} from '@angular/core';

/**
 * Directive to set a backup image on an image tag if the first image is not found
 */
@Directive({
  selector: 'img[flBackupImage]'
})
export class FlBackupImageDirective {

  @Input() flBackupImage: string;

  @HostListener('error')
  onError(): void {
    if (this.elementRef.nativeElement.src !== this.flBackupImage) {
      this.elementRef.nativeElement.src = this.flBackupImage;
    }
  }

  constructor(private elementRef: ElementRef<HTMLImageElement>) {
  }

}
