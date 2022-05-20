import {Pipe, PipeTransform} from '@angular/core';
import {FlTag, FlTagHelper} from '../fl-tag.class';

@Pipe({
  name: 'flTagColor'
})
export class FlTagColorPipe implements PipeTransform {

  transform(tag: FlTag): string {
    if (tag == null) return '';

    return FlTagHelper.getTagDefaultColor(tag.key, tag.value);
  }

}
