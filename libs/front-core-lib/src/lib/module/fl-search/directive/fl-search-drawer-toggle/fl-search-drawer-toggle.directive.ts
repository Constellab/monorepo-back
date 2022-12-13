import {Directive, HostListener} from '@angular/core';
import {FlSearchState} from '../../model/fl-search.state';

/**
 * Simple directive to toggle the drawer from the search component
 */
@Directive({
  selector: '[flSearchDrawerToggle]'
})
export class FlSearchDrawerToggleDirective {

  @HostListener('click')
  onClick(): void {
    this.searchState.toggleDrawer();
  }

  constructor(private searchState: FlSearchState<any>) { }

}

