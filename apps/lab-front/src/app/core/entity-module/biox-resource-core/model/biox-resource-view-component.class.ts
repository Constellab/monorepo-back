import {BioxResourceView} from '../../../model/entities/resource/biox-resource-view.entity';
import {Directive, Input} from '@angular/core';


@Directive()
export class BioxResourceViewDirective<T extends BioxResourceView = BioxResourceView> {

  @Input() view: T;

  @Input() fullscreen: boolean;

}
