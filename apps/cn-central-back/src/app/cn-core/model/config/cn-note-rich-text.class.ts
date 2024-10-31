import {
  BlBadRequestException, BlNewRichText,
  BlRichTextContent,
  BlRichTextContentWithModifications,
  BlRichTextModifications
} from '@monorepo/back-core-lib';

export class CnNoteRichText{
  private richTextWithModifications: BlRichTextContentWithModifications;
  private fromPython: boolean;

  constructor(jsonData: any, fromPython: boolean = false) {
    this.richTextWithModifications = new BlRichTextContentWithModifications(jsonData);
    this.fromPython = fromPython;
  }

  public getRichTextWithModifications(): BlRichTextContentWithModifications {
    return this.richTextWithModifications;
  }

  public getRichTextContent(): BlRichTextContent {
    return this.richTextWithModifications.content;
  }

  public getModifications(): Record<string, any> {
    return this.richTextWithModifications.modifications;
  }

  public getUndoContent(modificationId: string): BlRichTextContent{
    if(!this.richTextWithModifications.modifications){
      throw new BlBadRequestException('The note has no modifications');
    }
    const richText = new BlNewRichText(this.richTextWithModifications.content);
    const modifications = this.fromPython
      ? BlRichTextModifications.fromPythonJsonObject(this.richTextWithModifications.modifications)
      : BlRichTextModifications.fromJsonObject(this.richTextWithModifications.modifications);
    const modificationsBlocks = modifications.getModificationsFromModificationId(modificationId);
    return richText.undoModifications(modificationsBlocks);
  }
}
