import {ElementRef, Injectable, OnDestroy} from '@angular/core';
import {ConnectedPosition} from '@angular/cdk/overlay';
import {BehaviorSubject, Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {FlPortalService} from './fl-portal.service';
import {FlOverlayConfig, FlPortalDefaultPosition} from './model/portal/fl-portal.class';
import {FlOverlayRef} from './model/portal/fl-overlay-ref.class';
import {FlPortalConfig} from './model/portal/fl-portal-config';
import {FlTooltipComponent} from '../module/fl-core-component/component/fl-tooltip/fl-tooltip.component';
import {FlTranslateService} from '../module/fl-translate/service/fl-translate.service';
import {FlTranslateParam} from '../module/fl-translate/model/fl-translate-param';

/**
 * Service to create tooltip in typescript
 */
@Injectable()
export class FlTooltipService implements OnDestroy {

  // store the current overlay
  private overlays: Map<string, FlOverlayRef> = new Map();

  // store the current subject to dispose overlay
  private disposeTooltip: Map<string, Subject<string>> = new Map();

  constructor(private portalService: FlPortalService, private translateService: FlTranslateService) {
  }

  /**
   * Open a message in tooltip in a portal.
   * If a portal with the same uniqueId is currently open,
   * it resets the duration of the already existing overlay
   * @param element linked element
   * @param message message to display
   * @param position portal position
   * @param uniqueId unique id for the tooltip (to be able to close it and prevent reopening it)
   * @param duration duration of the tooltip
   */
  public openTooltip(element: Element | ElementRef,
                     message: string,
                     position: ConnectedPosition[] | FlPortalDefaultPosition,
                     uniqueId: string,
                     duration: number = 3000): FlOverlayRef {
    // check if the overlay already exists
    if (this.overlays.has(uniqueId)) {
      // emit a value in the subject to reset the debounce timer
      this.disposeTooltip.get(uniqueId).next(uniqueId);
      return this.overlays.get(uniqueId);
    }

    // configure the portal
    const config: FlOverlayConfig = {
      disposeOnNavigation: true,
      scrollStrategy: this.portalService.getCloseOnScrollStrategy()
    };


    // configure the portal position
    const configurer: FlPortalConfig =
      this.portalService.configureRelativePortal(element, position, config);

    // create the portal
    const overlay = this.portalService.createPortal(FlTooltipComponent, configurer, message);

    // save the overlay to close it later
    this.overlays.set(uniqueId, overlay);

    // call the observable to close the overlay
    const subject$ = new BehaviorSubject(uniqueId);
    this.disposeTooltip.set(uniqueId, subject$);

    // dispose the overlay after 'duration' time of idle (not reopened the tooltip)
    subject$.pipe(debounceTime(duration)).subscribe(
      id => this.disposeOverlay(id)
    );

    return overlay;
  }

  /**
   * Open a translated message in a tooltip in a portal
   * If a portal with the same uniqueId is currently open,
   * it resets the duration of the already existing overlay
   * @param element linked element
   * @param message message to display
   * @param position portal position
   * @param uniqueId unique id for the tooltip (to be able to close it)
   * @param duration duration of the tooltip
   * @param translateParams translate params
   */
  public openTooltipWithTranslate(element: Element | ElementRef,
                                  message: string,
                                  position: ConnectedPosition[] | FlPortalDefaultPosition,
                                  uniqueId: string,
                                  duration: number = 3000,
                                  translateParams: FlTranslateParam = {}): FlOverlayRef {
    return this.openTooltip(element, this.translateService.translate(message, translateParams),
      position, uniqueId, duration);
  }

  // dispose the overlay and clear the saved object and subject
  private disposeOverlay(uniqueId: string): void {
    const overlay = this.overlays.get(uniqueId);
    if (overlay) {
      overlay.dispose();
      this.overlays.delete(uniqueId);
    }

    const subject$ = this.disposeTooltip.get(uniqueId);
    if (subject$) {
      subject$.complete();
      this.disposeTooltip.delete(uniqueId);
    }
  }

  ngOnDestroy(): void {
    // clear all tooltip
    for (const key of this.overlays) {
      this.disposeOverlay(key[0]);
    }
  }
}
