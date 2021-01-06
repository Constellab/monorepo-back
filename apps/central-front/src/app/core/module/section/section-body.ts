import {Directive, TemplateRef} from '@angular/core';

@Directive({
  selector: '[genSectionBody]'
})
export class SectionBodyDirective {
  constructor(public _template: TemplateRef<any>) {
  }
}
