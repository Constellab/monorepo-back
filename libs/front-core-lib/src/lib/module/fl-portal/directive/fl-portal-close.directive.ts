import {Directive, HostListener, Input} from '@angular/core';
import {FlOverlayRef} from '../model/fl-overlay-ref.class';

@Directive({
  selector: '[flPortalClose]'
})
export class FlPortalCloseDirective {

  /**
   * Data to send when closing portal using this button
   */
  @Input() flPortalClose: any = null;

  constructor(private overlayRef: FlOverlayRef) {
  }

  @HostListener('click')
  click(): void {
    // when value is '' consider it as null
    this.overlayRef.dispose(this.flPortalClose === '' ? null: this.flPortalClose);
  }

}
