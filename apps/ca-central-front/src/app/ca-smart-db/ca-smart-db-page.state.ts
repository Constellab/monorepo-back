import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {CaSmartDbDoc} from './model/ca-document.class';


@Injectable()
export class CaSmartDbPageState {

  private selectedResult$: BehaviorSubject<CaSmartDbDoc> = new BehaviorSubject<CaSmartDbDoc>(null);


  public getSelectedResult$(): Observable<CaSmartDbDoc> {
    return this.selectedResult$.asObservable();
  }

  public selectResult(result: CaSmartDbDoc): void {
    this.selectedResult$.next(result);
  }
}
