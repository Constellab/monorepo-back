import {OverlayRef} from '@angular/cdk/overlay';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ComponentPortal, TemplatePortal} from '@angular/cdk/portal';
import {ComponentRef, EmbeddedViewRef} from '@angular/core';

/**
 * Wrapper for the OverlayRef
 *
 * It allows to pass data to the dispose method for the overlay opener
 */
export class FlOverlayRef {

  private overlayResult: any;

  constructor(public overlayRef: OverlayRef) {
  }

  /**
   * Cleans up the overlay from the DOM.
   * @param overlayResult Optional result to return to the overlay opener.
   */
  public dispose(overlayResult ?: any): void {
    if (overlayResult != null) {
      this.overlayResult = overlayResult;
    }
    this.overlayRef.dispose();
  }

  /** Gets an observable that emits when the overlay has been detached. */
  public detachments(): Observable<any> {
    // return the overlay detachment and map the current overlay result
    return this.overlayRef.detachments().pipe(
      map(() => this.overlayResult)
    );
  }

  public attach<T>(portal: ComponentPortal<T>): ComponentRef<T>;
  public attach<T>(portal: TemplatePortal<T>): EmbeddedViewRef<T>;
  public attach(portal: any): any {
    return this.overlayRef.attach(portal);
  }

  /** Gets an observable that emits when the backdrop has been clicked. */
  public backdropClick(): Observable<MouseEvent> {
    return this.overlayRef.backdropClick();
  }
}
