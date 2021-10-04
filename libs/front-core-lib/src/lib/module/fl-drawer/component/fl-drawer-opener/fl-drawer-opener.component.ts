import {Component, HostListener, Input, OnInit} from '@angular/core';
import {MatDrawer} from '@angular/material/sidenav';

/**
 * Component to be placed under a mzt-sidenav or mat-drawer. It will open the drawer on mouse hover.
 */
@Component({
  selector: 'fl-drawer-opener',
  templateUrl: './fl-drawer-opener.component.html',
  styleUrls: ['./fl-drawer-opener.component.scss']
})
export class FlDrawerOpenerComponent implements OnInit {

  @Input() drawer: MatDrawer;

  constructor() {

  }

  ngOnInit(): void {
  }

  @HostListener('mouseenter') onMouseEnter(): void {
    this.openDrawer();
  }

  @HostListener('mouseclick') onMouseClick(): void {
    this.openDrawer();
  }

  private openDrawer(): void {
    this.drawer.open();
  }

}
