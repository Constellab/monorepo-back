import {MonoTypeOperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';


/**
 * Simple RXJS operator to create an @{link FlEventWrapper} from an {@link Event}
 */
export function flRxjsEventWrapper(): MonoTypeOperatorFunction<FlEventWrapper> {
  return map(event => {
    if (event instanceof Event) {
      return new FlEventWrapper(event);
    }
    throw new Error('The object is not an event');
  });
}


/**
 * class that wrap the js Event class to add functionalities
 */
export class FlEventWrapper<T extends Event = Event> {

  constructor(public event: T) {
  }

  /**
   * static methode to check if an element has a class
   */
  private static elementHasClass(element: HTMLElement, className: string): boolean {
    const elementClass: string = element.className;
    if (elementClass == null || typeof elementClass !== 'string') {
      return false;
    }

    return elementClass.indexOf(className) !== -1;
  }

  /**
   * return true if the event target or the parent of this target is the element
   * @param element
   */
  public elementIsParent(element: Element): boolean {
    const targets: Element[] = this.event.composedPath() as Element[];

    for (const target of targets) {
      // we stop if we reach the element
      if (target === element) {
        return true;
      }
    }

    return false;
  }

  /**
   * return true if the event target or the parent of this target has the class
   * @param className name of the class to check
   */
  public parentHasClass(className: string): boolean {
    const targets: HTMLElement[] = this.event.composedPath() as HTMLElement[];

    for (const target of targets) {
      if (FlEventWrapper.elementHasClass(target, className)) {
        return true;
      }
    }

    return false;
  }


}
