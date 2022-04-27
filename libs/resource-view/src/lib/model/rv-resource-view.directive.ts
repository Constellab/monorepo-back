import {Directive, Input} from '@angular/core';
import {RvResourceViewBase, RvViewDisplayMode} from './rv-resource-view.class';
import {RvViewConfig} from './rv-view-config.class';


@Directive()
export class RvResourceViewDirective<T extends RvResourceViewBase = RvResourceViewBase> {

  @Input() view: T;

  @Input() resourceId: string;

  @Input() config: RvViewConfig;

  @Input() displayMode: RvViewDisplayMode = 'fullScreen';

}
