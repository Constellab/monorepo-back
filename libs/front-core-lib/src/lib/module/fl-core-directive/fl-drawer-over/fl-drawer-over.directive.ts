import {Directive, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {MediaObserver} from '@angular/flex-layout';
import {FlMediaAlias} from '../../../model/fl-media-alias.class';
import {MatDrawer, MatDrawerMode} from '@angular/material/sidenav';

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
  }

  private onMediaChange(): void {
    if (this.media.isActive('lt-lg')) {
      this.matDrawer.mode = 'over';
    } else {
      this.matDrawer.mode = this.initialMode;
    }
  }


  ngOnDestroy(): void {
    this.mediaSubscription?.unsubscribe();
  }


}
