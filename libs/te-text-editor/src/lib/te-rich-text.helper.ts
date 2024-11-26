import { TeRichText, TeRichTextDTO } from './te-rich-text.class';
import { TeRichTextBlockModificationsDTO } from './te-rich-text-block-modification.dto';
import { TeRichTextModifications } from './te-rich-text-modifications.class';
import { TeRichTextAggregate } from './te-rich-text-aggregate.class';

/**
 * Class that contains method to simply comparaison and undo of rich text without migrating the content
 */
export class TeRichTextHelper {
  public static compareRichTexts(
    oldRichText: TeRichTextDTO,
    newRichText: TeRichTextDTO,
    oldModifications: TeRichTextBlockModificationsDTO | null,
    userId: string
  ): TeRichTextBlockModificationsDTO {
    // provide the target version so that it does not migrate the content
    const richText = new TeRichText(oldRichText, oldRichText.version);
    const modifications = TeRichTextModifications.fromJsonObject(oldModifications, oldModifications?.version);

    const richTextAggregate = new TeRichTextAggregate(richText, modifications);

    const newRichTextObj = new TeRichText(newRichText);
    const newModifications = richTextAggregate.compareWithCurrent(newRichTextObj, userId);
    return newModifications.toJsonObject();
  }

  public static getRichTextPreviousVersion(
    richText: TeRichTextDTO,
    modifications: TeRichTextBlockModificationsDTO | null,
    modificationId: string
  ): TeRichTextDTO {
    // provide the target version so that it does not migrate the content
    const richTextObj = new TeRichText(richText, richText.version);
    const modificationsObj = TeRichTextModifications.fromJsonObject(modifications, modifications?.version);

    const richTextAggregate = new TeRichTextAggregate(richTextObj, modificationsObj);

    richTextAggregate.undoModifications(modificationId);
    return richTextAggregate.getRichTextAsJson();
  }
}
