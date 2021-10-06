import {BioxResourceViewBase} from '../../../model/entities/resource/biox-resource-view.entity';

export interface BioxResourceViewComponent<T extends BioxResourceViewBase = BioxResourceViewBase> {

  view: T;
}
