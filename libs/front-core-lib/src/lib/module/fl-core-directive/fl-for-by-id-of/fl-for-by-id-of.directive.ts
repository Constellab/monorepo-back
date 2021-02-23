import {Directive, Input, IterableDiffers, NgIterable, TemplateRef, ViewContainerRef} from '@angular/core';
import {NgForOf, NgForOfContext} from '@angular/common';
import {ClHelpService} from '@monorepo/core-lib';

interface WithId {
  id: any;
}

/**
 * Directive that extends NgForOf to automatically set the trackBy
 * to track by ids
 */
@Directive({
  selector: '[flForById]'
})
export class FlForByIdOfDirective <T extends WithId, U extends NgIterable<T> = NgIterable<T>>
  extends NgForOf<T, U> {

  constructor(_viewContainer: ViewContainerRef, _template: TemplateRef<NgForOfContext<T, U>>,
              _differs: IterableDiffers) {
    super(_viewContainer, _template, _differs);
    // set the track by id
    this.ngForTrackBy = ClHelpService.trackByIdFunction();
  }

  @Input()
  set flForByIdOf(ngForOf: U & NgIterable<T> | undefined | null) {
    this.ngForOf = ngForOf;
  }
}
