import {Pipe, PipeTransform, SecurityContext} from '@angular/core';
import {marked} from 'marked';
import {DomSanitizer} from '@angular/platform-browser';

@Pipe({
  name: 'tdMarkdown'
})
export class TdMarkdownPipe implements PipeTransform {

  constructor(private domSanitizer: DomSanitizer) {
  }

  transform(value: string): string {
    return this.domSanitizer.sanitize(SecurityContext.NONE, marked.parse(value));
  }

}
