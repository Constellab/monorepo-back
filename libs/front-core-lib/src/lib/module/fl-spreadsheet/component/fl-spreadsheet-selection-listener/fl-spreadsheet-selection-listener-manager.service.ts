import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

/**
 * Store the subject for a group and how many are registered to it
 */
interface GroupSelected {
  count: number;
  subject: Subject<symbol>;
}

/**
 * Group manager for {@link FlSpreadsheetSelectionListenerComponent}
 * When two components are in the same group they can't be activated at the same time. An activation
 * deactivate other components (like radio button)
 */
@Injectable({providedIn: 'root'})
export class FlSpreadsheetSelectionListenerManagerService {

  private groups: Map<string, GroupSelected> = new Map();

  public unregisterListener(group: string): void {
    if (!this.groups.has(group)) return;
    const groupSelected = this.groups.get(group);
    groupSelected.count--;

    // if there is not more registered to it, clear the subject and remove group
    if (groupSelected.count === 0) {
      groupSelected.subject.complete();
      this.groups.delete(group);
    }
  }

  /**
   * The children FlSpreadsheetSelectionInputComponent emit its id when it selected
   */
  public emitSelection(group: string, id: symbol): void {
    if (!this.groups.has(group)) return;
    this.groups.get(group).subject.next(id);
  }

  /**
   * Use to subscribe to selection change event
   */
  public subscribeToSelection(group: string): Observable<symbol> {
    if (!this.groups.has(group)) {
      this.groups.set(group, {count: 1, subject: new Subject()});
    } else {
      this.groups.get(group).count++;
    }
    return this.groups.get(group).subject.asObservable();
  }
}
