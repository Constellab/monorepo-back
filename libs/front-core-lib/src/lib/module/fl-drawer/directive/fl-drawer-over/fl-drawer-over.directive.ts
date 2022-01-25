import {Directive, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {MediaObserver} from '@angular/flex-layout';
import {MatDrawer, MatDrawerMode} from '@angular/material/sidenav';
import {FlMediaAlias} from '../../../../model/fl-media-alias.class';

/**
 * Directive that work on mat-drawer and mat-sidenav to change the mode base on screen size.
 * When the input media is active, it switched the mode to over
 *
 * This is useful to make the drawer over on small screen
 */
@Directive({
  selector: '[flDrawerOver]'
})
export class FlDrawerOverDirective implements OnInit, OnDestroy {

  /**
   * When the media alias is active, the drawer mode switched to over
   */
  @Input() flDrawerOver: FlMediaAlias;

  /**
   * If true, on init this will close the drawer if the mode is over. And this will
   * open the drawer in other modes
   */
  @Input() flDrawerCloseOverOnInit: boolean = true;


  private mediaSubscription: Subscription;

  private initialMode: MatDrawerMode;

  constructor(private media: MediaObserver,
              private matDrawer: MatDrawer) {
  }

  ngOnInit(): void {
    this.initialMode = this.matDrawer.mode;

    this.mediaSubscription = this.media.asObservable().subscribe(
      () => this.onMediaChange()
    );

    // if the option is active, open the drawer only if over is not active
    if (this.flDrawerCloseOverOnInit) {
      this.matDrawer.opened = !this.media.isActive(this.flDrawerOver);
    }
  }

  private onMediaChange(): void {
    if (this.media.isActive(this.flDrawerOver)) {
      this.matDrawer.mode = 'over';
    } else {
      this.matDrawer.mode = this.initialMode;
    }
  }


  ngOnDestroy(): void {
    this.mediaSubscription?.unsubscribe();
  }


}
