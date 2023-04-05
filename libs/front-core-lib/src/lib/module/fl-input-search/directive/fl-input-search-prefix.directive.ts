import {Directive, TemplateRef} from '@angular/core';
import {FlViewContext} from '../../../model/fl-view-context.class';

/**
 * Directive to define the template for the prefix of the input search
 */
@Directive({
  selector: '[flInputSearchPrefix]'
})
export class FlInputSearchPrefixDirective {

  constructor(private templateRef: TemplateRef<FlViewContext>) {
  }

}
