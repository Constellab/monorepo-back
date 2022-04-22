import {Directive, Input} from '@angular/core';
import {RvResourceView, RvViewDisplayMode} from './rv-resource-view.class';
import {RvViewConfig} from './rv-view-config.class';


@Directive()
export class RvResourceViewDirective<T extends RvResourceView = RvResourceView> {

  @Input() view: T;

  @Input() resourceId: string;

  @Input() config: RvViewConfig;

  @Input() displayMode: RvViewDisplayMode = 'fullScreen';

}
