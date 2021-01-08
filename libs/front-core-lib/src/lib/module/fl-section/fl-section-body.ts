import {Directive, TemplateRef} from '@angular/core';

@Directive({
  selector: '[flSectionBody]'
})
export class FlSectionBodyDirective {
  constructor(public _template: TemplateRef<any>) {
  }
}
