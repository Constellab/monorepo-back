import {FlColorHelper} from '@monorepo/front-core-lib';

/**
 * return the port color base on first type
 */
export function getBioxProcessPortColor(types: string[]): string {
  if (types == null || types.length === 0) {
    return '#ffffff';
  } else {
    return FlColorHelper.stringToRGBColor(types[0]);
  }
}
