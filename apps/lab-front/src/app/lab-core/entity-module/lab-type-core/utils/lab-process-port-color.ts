import {FlColorHelper} from '@monorepo/front-core-lib';
import {TdIOSpecDTO} from '@monorepo/technical-doc';

/**
 * return the port color base on first type
 */
export function labGetProcessPortColor(types: TdIOSpecDTO): string {
  if (types == null || types.resource_types.length === 0) {
    return '#ffffff';
  } else {
    return labGetTypingNameColor(types.resource_types[0].typing_name);
  }
}

/**
 * Return the color for a Typing name
 */
export function labGetTypingNameColor(typingName: string): string {
  if (typingName == null || typingName.length === 0) {
    return '#ffffff';
  } else {
    return FlColorHelper.stringToRGBColor(typingName);
  }
}
