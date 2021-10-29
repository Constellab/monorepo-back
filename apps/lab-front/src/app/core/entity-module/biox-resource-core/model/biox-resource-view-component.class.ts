import {BioxResourceViewBase} from '../../../model/entities/resource/biox-resource-view.entity';
import {Directive, Input} from '@angular/core';


@Directive()
export class BioxResourceViewDirective<T extends BioxResourceViewBase = BioxResourceViewBase> {

  @Input() view: T;

  @Input() fullscreen: boolean;

}
