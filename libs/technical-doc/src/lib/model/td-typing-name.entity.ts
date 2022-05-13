/**
 * Base class to find the unique name or brick name of a typing name
 */
export class TdTypingName {

  static getBrickName(typingName: string): string {
    return this.splitedTypingname(typingName)[1];
  }

  static getUniqueName(typingName: string): string{
    return this.splitedTypingname(typingName)[2];
  }

  private static splitedTypingname(typingName: string): string[] {
    return typingName.split('.'); // 0: type, 1: brickName, 2: uniqueName
  }


}
