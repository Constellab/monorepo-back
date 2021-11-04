import {FlColorHelper} from '@monorepo/front-core-lib';
import {BioxIOSpec} from '../../../model/entities/biox-io.entity';

/**
 * return the port color base on first type
 */
export function getBioxProcessPortColor(types: BioxIOSpec[]): string {
  if (types == null || types.length === 0) {
    return '#ffffff';
  } else {
    return FlColorHelper.stringToRGBColor(types[0].typing_name);
  }
}
