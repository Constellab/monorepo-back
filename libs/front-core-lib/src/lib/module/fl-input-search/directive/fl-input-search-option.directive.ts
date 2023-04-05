import {Directive, TemplateRef} from '@angular/core';
import {FlViewContext} from '../../../model/fl-view-context.class';

/**
 * Directive to define the template for the options of the input search
 */
@Directive({
  selector: '[flInputSearchOption]'
})
export class FlInputSearchOptionDirective {

  constructor(private templateRef: TemplateRef<FlViewContext>) {
  }

}
