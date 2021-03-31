import {Directive, OnDestroy} from '@angular/core';
import {Observable, Subject} from 'rxjs';

/**
 * Directive to group all the {@link FlSpreadsheetSelectionInputComponent} into one group
 * When two component are in the same group they can't be activated at the same time. An activation
 * deactivate other component (like radio button)
 */
@Directive({
  selector: '[flSpreadsheetSelectionInputGroup]'
})
export class FlSpreadsheetSelectionInputGroupDirective implements OnDestroy {

  private selectedComponent: Subject<number> = new Subject<number>();

  constructor() {
  }

  /**
   * The children FlSpreadsheetSelectionInputComponent emit its id when it selected
   * @param id
   */
  public emitSelection(id: number): void {
    this.selectedComponent.next(id);
  }

  /**
   * Use to subscribe to selection change event
   */
  public subscribeToSelection(): Observable<number> {
    return this.selectedComponent.asObservable();
  }

  ngOnDestroy(): void {
    this.selectedComponent.complete();
  }


}
