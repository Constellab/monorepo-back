import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FL_PORTAL_DATA} from '../../../fl-portal/model/fl-portal.class';
import {FlMenuDynamic} from '../../model/fl-menu-dynamic.class';
import {MatMenuTrigger} from '@angular/material/menu';
import {FlOverlayRef} from '../../../fl-portal/model/fl-overlay-ref.class';

/**
 * this is a simple portal to wrap the menu-dynamic
 */
@Component({
  selector: 'fl-menu-dynamic-portal',
  templateUrl: './fl-menu-dynamic-portal.component.html',
  styleUrls: ['./fl-menu-dynamic-portal.component.scss']
})
export class FlMenuDynamicPortalComponent implements OnInit, AfterViewInit {

  @ViewChild(MatMenuTrigger, {static: true}) menuTrigger: MatMenuTrigger;

  menu: FlMenuDynamic[];


  constructor(@Inject(FL_PORTAL_DATA) menu: FlMenuDynamic[],
              private overlayRef: FlOverlayRef) {
    this.menu = menu;
  }

  ngOnInit(): void {
    // when the menu closed, dispose the overlay
    this.menuTrigger.menuClosed.subscribe(
      () => this.overlayRef.dispose()
    );
  }

  // open the menu on start
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.menuTrigger.openMenu();
    }, 0);
  }


}
