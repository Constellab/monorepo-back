/**
 * Helper to manage HTML
 */
export class FlHtmlHelper {

  constructor() {
  }

  /**
   * Scroll to the element only if it is not visible
   * return true if we scrolled
   */
  public static scrollToElementIfNotVisible(element: HTMLElement): boolean {
    if (!FlHtmlHelper.isElementInViewport(element)) {
      element.scrollIntoView({block: 'nearest', inline: 'nearest'});
      return true;
    }

    return false;
  }

  /**
   * return true if the element is fully in the view port
   * @param element
   */
  public static isElementInViewport(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();

    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
    );
  }

  /**
   * return true if the element is a child of the parent
   * @param element
   * @param parent if string, it compares with the classe
   */
  public static isChildOf(element: HTMLElement, parent: HTMLElement | string): boolean {
    let current: HTMLElement = element;

    while (current != null && current.tagName !== 'BODY') {
      if (parent instanceof HTMLElement) {
        if (current === parent) return true;
      } else {
        if (current.classList.contains(parent)) return true;
      }
      current = current.parentElement;
    }

    return false;
  }
}
