/**
 * Event type emitted by the {@link FlMouseHoverAbstractDirective} directive, on hover status change
 */
export interface FlMouseHoverChange {
  /**
   * Whether or not the user is hovering the host element
   */
  isHovering: boolean;

  /**
   * The js mouse event of the enter or leave event
   */
  event: MouseEvent;
}
