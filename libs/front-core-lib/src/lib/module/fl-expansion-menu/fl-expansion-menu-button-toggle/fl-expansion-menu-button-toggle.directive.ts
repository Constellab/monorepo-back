import {Directive, HostListener} from '@angular/core';
import {FlExpansionMenuComponent} from '../fl-expansion-menu/fl-expansion-menu.component';

/**
 * Directive to place on an element inside a {@link FlExpansionMenuComponent}
 * to toggle menu on click
 */
@Directive({
  selector: '[flExpansionMenuButtonToggle]'
})
export class FlExpansionMenuButtonToggleDirective {

  @HostListener('click')
  click(): void {
    this.expansionMenuComponent.toggleMenu();
  }

  constructor(private expansionMenuComponent: FlExpansionMenuComponent) {
  }


}
