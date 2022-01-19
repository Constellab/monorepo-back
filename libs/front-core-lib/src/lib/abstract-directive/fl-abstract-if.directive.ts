import {Directive, OnDestroy, OnInit, TemplateRef, ViewContainerRef} from '@angular/core';
import {Observable, Subscription} from 'rxjs';

/**
 * Abstract class to simplify creation of structural directive that
 * work like ngIf (directive to show or hide content based on condition).
 */
@Directive()
export abstract class FlAbstractIfDirective implements OnInit, OnDestroy {

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

  private subscription: Subscription;

  protected constructor(
    protected templateRef: TemplateRef<any>,
    protected viewContainer: ViewContainerRef) {
  }

  ngOnInit(): void {
    this.updateView();
  }


  /**
   * Method to update the view (hide or show content)
   */
  private updateView(): void {
    const showView: boolean | Observable<boolean> = this.showView();

    if (showView instanceof Observable) {
      this.subscription = showView.subscribe(
        result => this.toggleView(result)
      );
    } else {
      this.toggleView(showView);
    }
  }

  private toggleView(showView: boolean): void {
    if (showView) {
      this.createTemplate();
    } else {
      this.destroyTemplate();
    }
  }


  private createTemplate(): void {
    // check if it's hidden or not
    if (this.currentMode !== 'show') {
      // create the view
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.currentMode = 'show';
    }
  }

  private destroyTemplate(): void {
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

  /**
   * Method to check if the view has to be shown
   *
   * If returns true, the view is created otherwise it is hidden
   */
  protected abstract showView(): boolean | Observable<boolean>;

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }


}
