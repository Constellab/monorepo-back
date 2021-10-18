import {Directive, TemplateRef, ViewContainerRef} from '@angular/core';

/**
 * Abstract class to simplify creation of structural directive that
 * work like ngIf (directive to show or hide content based on condition).
 */
@Directive()
export abstract class FlAbstractIfDirective {

  /**
   * Current status of the view
   * Show --> the template under if is shown
   * Else --> the else template is shown
   * None --> nothing is shown
   */
  protected currentMode: 'show' | 'else' | 'none' = 'none';

  /**
   * If the directive support the else condition
   *
   * Set the template ref for the else here before calling updateView
   */
  protected elseTemplateRef: TemplateRef<any>;

  protected constructor(
    protected templateRef: TemplateRef<any>,
    protected viewContainer: ViewContainerRef
  ) {
  }

  /**
   * Method to update the view (hide or show content)
   *
   * Call this method when the inputs changed
   */
  protected updateView(): void {
    if (this.showView()) {
      // check is it's hidden or not
      if (this.currentMode !== 'show') {
        // create the view
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.currentMode = 'show';
      }
    } else {
      // check the new mode of display (if the else template exists)
      const newMode = this.elseTemplateRef == null ? 'none' : 'else';

      // check that the mode has changed otherwise do nothing
      if (newMode !== this.currentMode) {
        this.viewContainer.clear();

        // if an else template exists create the else view
        if (newMode === 'else') {
          this.viewContainer.createEmbeddedView(this.elseTemplateRef);
        }

        this.currentMode = newMode;
      }
    }
  }

  /**
   * Method to check if the view has to be shown
   *
   * If returns true, the view is created otherwise it is hidden
   */
  protected abstract showView(): boolean;
}
