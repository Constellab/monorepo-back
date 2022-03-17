import {Directive, OnDestroy} from '@angular/core';
import {Observable, Subject} from 'rxjs';

/**
 * Directive to group all the {@link FlSpreadsheetSelectionInputComponent} into one group
 * When two components are in the same group they can't be activated at the same time. An activation
 * deactivate other components (like radio button)
 */
@Directive({
  selector: '[flSpreadsheetSelectionInputGroup]'
})
export class FlSpreadsheetSelectionInputGroupDirective implements OnDestroy {

  private selectedComponent: Subject<symbol> = new Subject();

  constructor() {
  }

  /**
   * The children FlSpreadsheetSelectionInputComponent emit its id when it selected
   * @param id
   */
  public emitSelection(id: symbol): void {
    this.selectedComponent.next(id);
  }

  /**
   * Use to subscribe to selection change event
   */
  public subscribeToSelection(): Observable<symbol> {
    return this.selectedComponent.asObservable();
  }

  ngOnDestroy(): void {
    this.selectedComponent.complete();
  }


}
