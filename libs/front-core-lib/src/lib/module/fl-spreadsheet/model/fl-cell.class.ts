import {BehaviorSubject, Observable} from 'rxjs';
import {FlSheetSelectionRange} from './fl-sheet-selection-change.class';

export type FlCellSelectionChange = false | FlSheetSelectionRange;

export abstract class FlCell {
  private static idGenerator: number = 0;
  public id: number;

  // todo destroy
  private selected$: BehaviorSubject<FlCellSelectionChange> = new BehaviorSubject<FlCellSelectionChange>(false);

  protected constructor() {
    this.id = FlCell.idGenerator++;
  }


  public abstract editable: boolean;
  public value: any;

  get selected(): FlCellSelectionChange {
    return this.selected$.value;
  }

  public getSelected$(): Observable<FlCellSelectionChange> {
    return this.selected$.asObservable();
  }

  public select(range: FlCellSelectionChange): void{
    this.selected$.next(range);
  }

  public unselect(): void{
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
