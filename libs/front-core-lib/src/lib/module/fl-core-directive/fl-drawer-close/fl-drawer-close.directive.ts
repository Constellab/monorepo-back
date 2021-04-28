import {Directive, HostListener} from '@angular/core';
import {MatDrawer} from '@angular/material/sidenav';

/**
 * Simple directive to close a the current drawer or sidenav on close
 */
@Directive({
  selector: '[flDrawerClose]'
})
export class FlDrawerCloseDirective {

  constructor(private matDrawer: MatDrawer) {
  }

  @HostListener('click')
  click(): void {
    this.matDrawer.close();
  }

}
