import {Renderer2} from '@angular/core';
import {Observable, Subject} from 'rxjs';

/**
 * Class to work with render.listen method with observable
 *
 * The complete method must be call to clear the inner subject and listener
 */
export class FlRendererListenerObs {

  private subject: Subject<any> = new Subject();

  private readonly listener: () => void;

  constructor(renderer: Renderer2, target: 'window' | 'document' | 'body' | any,
              eventName: string) {
    this.listener = renderer.listen(target, eventName, (event) => this.onEvent(event));
  }

  private onEvent(event: any): void {
    this.subject.next(event);
  }

  public onEvent$(): Observable<any> {
    return this.subject.asObservable();
  }

  public complete(): void {
    this.subject.complete();
    this.listener();
  }
}
