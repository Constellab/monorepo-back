/**
 * Helper to manage HTML
 */
export class FlHtmlHelper {

  constructor() {
  }

  public static domTokenListToArray(tokenList: DOMTokenList): string[] {
    const array: string[] = [];
    for (let i = 0; i < tokenList.length; i++) {
      array.push(tokenList.item(i));
    }
    return array;
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
    return FlHtmlHelper.getParent(element, parent) != null;
  }

  /**
   * return the parent element that satisfy the condition. If not return null
   * @param element
   * @param parent if string, it compares with the classe
   */
  public static getParent(element: HTMLElement, parent: HTMLElement | string): HTMLElement | null {
    let current: HTMLElement = element;

    while (current != null && current.tagName !== 'BODY') {
      if (parent instanceof HTMLElement) {
        if (current === parent) return current;
      } else {
        if (current.classList.contains(parent)) return current;
      }
      current = current.parentElement;
    }

    return null;
  }
}
