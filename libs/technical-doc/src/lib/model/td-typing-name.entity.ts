/**
 * Base class to find the unique name or brick name of a typing name
 */
export class TdTypingName {

  typingName: string;

  constructor(typing_Name: string) {
    this.typingName = typing_Name;
  }

  getType(): string{
    return this.spitedTypename(this.typingName)[0];
  }

  getBrickName(): string{
    return this.spitedTypename(this.typingName)[1];
  }

  getUniqueName(): string{
    return this.spitedTypename(this.typingName)[2];
  }

  private spitedTypename(typingName: string): string[] {
    return typingName.split('.'); // 0: type, 1: brickName, 2: uniqueName
  }


}
