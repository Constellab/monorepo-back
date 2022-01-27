import {AfterViewInit, Component, Inject, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {FL_PORTAL_DATA} from '../../../fl-portal/model/fl-portal.class';
import {FlMenuDynamic} from '../../model/fl-menu-dynamic.class';
import {MatMenuTrigger} from '@angular/material/menu';
import {FlOverlayRef} from '../../../fl-portal/model/fl-overlay-ref.class';
import {FlEventWrapper} from '../../../../model/fl-event-wrapper.class';
import {FlMenuDynamicComponent} from '../fl-menu-dynamic/fl-menu-dynamic.component';

/**
 * this is a simple portal to wrap the menu-dynamic
 */
@Component({
  selector: 'fl-menu-dynamic-portal',
  templateUrl: './fl-menu-dynamic-portal.component.html',
  styleUrls: ['./fl-menu-dynamic-portal.component.scss']
})
export class FlMenuDynamicPortalComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(MatMenuTrigger, {static: true}) menuTrigger: MatMenuTrigger;

  menu: FlMenuDynamic[];

  private listener: () => void;

  constructor(@Inject(FL_PORTAL_DATA) menu: FlMenuDynamic[],
              private overlayRef: FlOverlayRef,
              private renderer: Renderer2) {
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

      this.listener = this.renderer.listen('body', 'mousedown',
        (event) => this.onBodyClick(event)
      );
    }, 0);
  }

  // use to close the menu if the click is outside the menu
  private onBodyClick(event: MouseEvent): void {
    const eventWrapper = new FlEventWrapper(event);

    // if the mouse event is in the mat menu, do nothing
    if (eventWrapper.parentHasClass(FlMenuDynamicComponent.containerClass)) {
      return;
    }

    // otherwise, close the menu (this means that the click is outside the menu)
    this.menuTrigger.closeMenu();
  }

  ngOnDestroy(): void {
    if (this.listener) {
      this.listener();
    }
  }


}
