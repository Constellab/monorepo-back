import {TdTypeObjectType} from './td-type.entity';

/**
 * Base class to find the unique name or brick name of a typing name
 */
export class TdTypingName {

  typingName: string;

  type: TdTypeObjectType;
  brickName: string;
  uniqueName: string;

  constructor(typingName: string) {
    this.typingName = typingName;

    const split = typingName.split('.'); // 0: type, 1: brickName, 2: uniqueName;
    this.type = split[0] as TdTypeObjectType;
    this.brickName = split[1];
    this.uniqueName = split[2];
  }
}
