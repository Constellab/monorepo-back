import {Injectable} from '@angular/core';

/**
 * Service to manage HTML
 */
@Injectable({
  providedIn: 'root'
})
export class FlHtmlService {

  constructor() {
  }

  /**
   * Scroll to the element only if it is not visible
   * return true if we scrolled
   */
  public scrollToElementIfNotVisible(element: HTMLElement): boolean {
    if (!this.isElementInViewport(element)) {
      element.scrollIntoView({block: 'nearest', inline: 'nearest'});
      return true;
    }

    return false;
  }

  /**
   * return true if the element is fully in the view port
   * @param element
   */
  public isElementInViewport(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();

    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
    );
  }
}
