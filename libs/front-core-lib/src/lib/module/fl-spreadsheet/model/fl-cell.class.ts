import {BehaviorSubject, Observable} from 'rxjs';
import {FlSheetSelectionRange} from './fl-sheet-selection.class';

export type FlCellSelectionChange = false | FlSheetSelectionRange;

export type FlCellEditChange = { edit: false, value: void } | { edit: true, value: string };

export abstract class FlCell {

  private static idGenerator: number = 0;
  public id: number;

  public abstract editable: boolean;
  private _value$: BehaviorSubject<any>;
  private _edit$: BehaviorSubject<FlCellEditChange> = new BehaviorSubject<FlCellEditChange>({edit: false, value: null});

  // todo destroy
  private selected$: BehaviorSubject<FlCellSelectionChange> = new BehaviorSubject<FlCellSelectionChange>(false);


  protected constructor(value: any = null) {
    this.id = FlCell.idGenerator++;
    this._value$ = new BehaviorSubject<any>(value);
  }

  get value(): any {
    return this._value$.value;
  }

  set value(value: any) {
    this._value$.next(value);
  }

  get value$(): Observable<any> {
    return this._value$.asObservable();
  }

  getEdit(): boolean {
    return this._edit$.value.edit;
  }

  /**
   *
   * @param edit if true, the cell change to edit mode
   * @param value if pass to edit mode, the value is concatenate to the cell value
   */
  setEdit(edit: true, value?: string): void;
  setEdit(edit: false): void;
  setEdit(edit: boolean, value?: string): void {
    if (edit !== this.getEdit()) {
      this._edit$.next({edit: edit, value: value} as any);
    }
  }

  public setValueAndCloseEdit(value: any): void {
    this.value = value;
    this.setEdit(false);
  }

  get edit$(): Observable<FlCellEditChange> {
    return this._edit$.asObservable();
  }


  get selected(): FlCellSelectionChange {
    return this.selected$.value;
  }

  public getSelected$(): Observable<FlCellSelectionChange> {
    return this.selected$.asObservable();
  }

  public select(range: FlCellSelectionChange): void {
    this.selected$.next(range);
  }

  public unselect(): void {
    if (this.selected !== false) {
      this.selected$.next(false);
    }
  }


}

export class FlBasicCell extends FlCell {
  public editable = true;

  constructor() {
    super();
    this.value = 'Super';
  }

}

export class FlColumnHeaderCell extends FlCell {
  public editable = false;

  constructor(index: number) {
    super();

    if (index === 0) {
      this.value = null;
    } else {
      this.value = index;
    }
  }
}

export class FlRowHeaderCell extends FlCell {
  public editable = false;

  constructor(index: number) {
    super();
    this.value = index;
  }
}

export const rowIdAttributeName: string = 'row-id';
export const columnIdAttributeName: string = 'column-id';
