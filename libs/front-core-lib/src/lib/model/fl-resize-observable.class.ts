import {ClHelpService} from '@monorepo/core-lib';
import {Observable, Subject} from 'rxjs';

/**
 * Wrapper of the ResizeObserver to observe the resize of one or more elements
 *
 * /!\ Call disconnect to clear the observable end listener
 * /!\ This runs outside NgZone
 */
export class FlResizeObservable {

  private readonly elements: HTMLElement[];

  private observer: ResizeObserver;

  private readonly subject: Subject<ResizeObserverEntry[]> = new Subject();

  constructor(elements: HTMLElement | HTMLElement[]) {
    this.elements = ClHelpService.convertObjectOrArrayToArray(elements);
    this.createObserver();
  }

  private createObserver(): void {
    this.observer = new ResizeObserver(entries => {
      this.subject.next(entries);
    });

    for (const element of this.elements) {
      this.observer.observe(element);
    }
  }

  /**
   * Get the resize observable
   * /!\ This runs outside NgZone
   */
  public getObs(): Observable<ResizeObserverEntry[]> {
    return this.subject.asObservable();
  }


  // clear listener and complete subject
  public disconnect(): void {
    this.observer.disconnect();
    this.subject.complete();
  }

}
