import {Pipe, PipeTransform} from '@angular/core';
import {FlTag} from '../fl-tag.class';

/**
 * Pipe to convert list of tags or record of tags to a list of tags
 */
@Pipe({
  name: 'flTagsToList'
})
export class FlTagsToListPipe implements PipeTransform {

  transform(tags: FlTag[] | Record<string, string>): FlTag[] {
    if (tags == null) return [];

    if (Array.isArray(tags)) return tags;
    return Object.keys(tags).map(key => ({key: key, value: tags[key]}));
  }

}
