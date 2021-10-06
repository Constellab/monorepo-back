import {PositionStrategy} from '@angular/cdk/overlay';
import {ElementRef} from '@angular/core';
import {FlOverlayConfig, FlRelativeOverlayConfig} from './fl-portal.class';

/**
 * Config for the portal
 */
export class FlPortalConfig {

  public config: FlOverlayConfig;

  constructor() {
  }

  public setPositionStrategy(strategy: PositionStrategy): void {
    this.config.positionStrategy = strategy;
  }

  // configure the overlay
  public configureOverlay(config: FlOverlayConfig): this {

    // configure the backdrop
    this.configureBackdrop(config);

    // configure the panel
    this.configurePanel(config);

    // save the config
    this.config = config;

    return this;
  }

  // configure the backdrop
  private configureBackdrop(config: FlOverlayConfig): void {
    if (config.backdropClass || config.transparentBackdrop) {
      // convert the backdrop classes to sting[] to simplify manipulation
      const backdropClass: string[] = this.convertToStringArray(config.backdropClass);
      // handle transparent backdrop
      if (config.transparentBackdrop) {
        backdropClass.push('g-transparent-background');
        config.hasBackdrop = true;
      }

      // set the class to the config
      config.backdropClass = backdropClass;
    }

    if (config.disposeOnBackdropClick) {
      config.hasBackdrop = true;
    }
  }

  // configure the panel
  protected configurePanel(config: FlOverlayConfig): void {
    // convert the panel class to string[] to simplify manipulation
    const panelClass: string[] = this.convertToStringArray(config.panelClass);

    // elevation
    if (config.elevation) {
      panelClass.push('mat-elevation-z5');
    }

    // manage the size
    switch (config.size) {
      case 'small':
        panelClass.push('g-small-dialog');
        break;
      case 'medium':
        panelClass.push('g-medium-dialog');
        break;
      case 'big':
        panelClass.push('g-big-dialog');
        break;
      case 'full':
        panelClass.push('g-full-dialog');
        break;
    }

    // set classes to config
    config.panelClass = panelClass;
  }


  // convert the string | string[] to string[]
  protected convertToStringArray(obj: string | string[]): string[] {
    let array: string[] = [];
    if (typeof obj === 'string') {
      array.push(obj);
    } else if (obj != null) {
      array = obj;
    }

    return array;
  }
}

export class FlRelativePortalConfig extends FlPortalConfig {

  public config: FlRelativeOverlayConfig;

  constructor(public hostElement: ElementRef<HTMLElement>) {
    super();
  }

  // configure the panel
  protected configurePanel(config: FlRelativeOverlayConfig): void {
    super.configurePanel(config);

    // manage host size
    switch (config.hostSize) {

      case 'width':
        config.width = this.hostElement.nativeElement.clientWidth;
        break;
      case 'height':
        config.height = this.hostElement.nativeElement.clientHeight;
        break;
      case 'both':
        config.height = this.hostElement.nativeElement.clientHeight;
        config.width = this.hostElement.nativeElement.clientWidth;
        break;

    }

  }
}
