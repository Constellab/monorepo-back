import { TeHTMLEditorJSON, TeRichText, TeRichTextDTO } from './te-rich-text.class';
import {
  TeRichTextBlockModification,
  TeRichTextModificationType,
} from './te-rich-text-block-modification.class';
import {
  TeRichTextBlockModificationsDTO,
  TeRichTextBlockModificationWithUser,
  TeRichTextGetUserFunction,
} from './te-rich-text-block-modification.dto';
import { TeBlock } from './te-block.class';
import { TeRichTextModifications } from './te-rich-text-modifications.class';

/**
 * Object stored in DB to save rich text content
 */
export interface TeNewFullRichTextDTO {
  version: number;
  richText: TeRichTextDTO;
  modifications?: TeRichTextBlockModificationsDTO;
}

export interface TeOldRichTextContentWithModificationsI {
  content: TeHTMLEditorJSON;
  modifications: TeRichTextBlockModificationsDTO;
}

/**
 * Full stored rich text content, if the migration is done, it will be TeNewFullRichTextContent
 * otherwise it will be TeRichTextContent
 */
export type TeRichTextAggregateJsonInput =
  | TeHTMLEditorJSON
  | TeOldRichTextContentWithModificationsI
  | TeNewFullRichTextDTO;


export class TeRichTextAggregate {
  private static readonly CURRENT_VERSION = 1;

  version: number;
  richText: TeRichText;
  modifications: TeRichTextModifications;

  constructor(
    richTexts?: TeRichText,
    modifications?: TeRichTextModifications,
    version: number = TeRichTextAggregate.CURRENT_VERSION
  ) {
    if (richTexts) {
      this.richText = richTexts;
    } else {
      this.richText = new TeRichText(TeRichText.emptyJson());
    }
    if (modifications) {
      this.modifications = modifications;
    } else {
      this.modifications = new TeRichTextModifications();
    }
    this.version = version;
  }

  public static fromJson(data: TeRichTextAggregateJsonInput): TeRichTextAggregate {
    // if the data is a TeRichTextContent or TeOldRichTextContentWithModificationsI
    // we need to migrate it to TeNewFullRichTextContent
    const anyContent = data as any;
    // case TeRichTextContent
    if (anyContent.time && anyContent.blocks) {
      const content: TeHTMLEditorJSON = anyContent;
      return new TeRichTextAggregate(new TeRichText(content));
      // Case TeOldRichTextContentWithModificationsI
    } else if (anyContent.content && !anyContent.version) {
      const content: TeOldRichTextContentWithModificationsI = anyContent;
      return new TeRichTextAggregate(
        new TeRichText(content.content),
        TeRichTextModifications.fromJsonObject(content.modifications)
      );
      // Case TeNewFullRichTextI
    } else {
      const content: TeNewFullRichTextDTO = anyContent as TeNewFullRichTextDTO;
      return new TeRichTextAggregate(
        new TeRichText(content.richText),
        TeRichTextModifications.fromJsonObject(content.modifications),
        content.version
      );
    }
  }

  /////////////////////////////// CONTENT /////////////////////////////////

  /**
   * Update the content of the rich text and update the modifications
   * @param content
   * @param userId
   */
  public updateContent(content: TeRichText, userId: string): void {
    const newModifications = this.compareWithCurrent(content, userId);
    this.modifications.fusion(newModifications);
    this.richText = content;
  }

  public getRichTextAsJson(): TeRichTextDTO {
    return this.richText.toJson();
  }

  ///////////////////////////////// MODIFICATIONS /////////////////////////////////

  /**
   * Compare the current rich text with a new rich text and return the differences
   * @param newRichText
   * @param userId
   */
  public compareWithCurrent(newRichText: TeRichText, userId: string): TeRichTextModifications {
    const differences: TeRichTextBlockModification[] = [];

    // find deleted blocks, start by the last block
    let index = this.richText.getBlocks().length - 1;
    for (const oldBlock of this.richText.getBlocks().reverse()) {
      if (!newRichText.hasBlock(oldBlock.id)) {
        // block is deleted
        const modif = new TeRichTextBlockModification(
          oldBlock.id,
          oldBlock.type,
          TeRichTextModificationType.DELETED,
          index,
          userId
        );
        modif.blockValue = oldBlock.data;
        differences.push(modif);
      }

      index--;
    }

    index = 0;
    for (const block of newRichText.getBlocks()) {
      const oldBlock = this.richText.getBlock(block.id);
      const oldBlockIndex = this.richText.getBlockIndex(block.id);
      if (oldBlock == null) {
        // block is new
        const modif = new TeRichTextBlockModification(
          block.id,
          block.type,
          TeRichTextModificationType.CREATED,
          index,
          userId
        );
        modif.blockValue = block.data;
        differences.push(modif);
      } else if (
        TeRichTextBlockModification.stringifyBlockData(oldBlock) !==
        TeRichTextBlockModification.stringifyBlockData(block)
      ) {
        // block is updated
        const modif = new TeRichTextBlockModification(
          block.id,
          block.type,
          TeRichTextModificationType.UPDATED,
          index,
          userId
        );
        modif.blockValue = block.data;
        // get the differences between the old block data and the new block data,
        // we stringify the data to compare them as string with the lib diff
        modif.setDifferences(oldBlock.data);
        differences.push(modif);
      } else if (oldBlockIndex !== -1 && oldBlockIndex != index) {
        // block is moved
        const modif = new TeRichTextBlockModification(
          block.id,
          block.type,
          TeRichTextModificationType.MOVED,
          index,
          userId
        );
        modif.oldIndex = oldBlockIndex; // old index of the block
        modif.blockValue = block.data;
        differences.push(modif);
      }
      index++;
    }

    return new TeRichTextModifications(differences);
  }

  /**
   * Undo the last modification (useful for the ctrl+z)
   */
  public undoLastModification(): TeRichTextBlockModification {
    const lastModification = this.modifications.getLastModification();
    if (lastModification) {
      this.undoModifications(lastModification.id);
      return lastModification;
    }
    return null;
  }

  // Undo the modifications in the modificationsList
  public undoModifications(modificationId: string): void {
    const modificationsList = this.modifications.getModificationsFromModificationId(modificationId);

    const newBlocks = this.richText.getBlocks();
    // Reverse to undo in the right order
    const reversedModifications = modificationsList.slice().reverse();

    for (const modification of reversedModifications) {
      switch (modification.type) {
        case TeRichTextModificationType.MOVED:
          const movedBlock: TeBlock = {
            id: modification.blockId,
            data: modification.blockValue,
            type: modification.blockType as any,
          };
          // remove the block from the old index and add it to the new index
          newBlocks.splice(modification.index, 1);
          newBlocks.splice(modification.oldIndex, 0, movedBlock);
          break;
        case TeRichTextModificationType.CREATED:
          // remove the block from the index
          newBlocks.splice(modification.index, 1);
          break;
        case TeRichTextModificationType.UPDATED:
          // undo the differences in the block data and add anti-slashes to the double quotes
          const b = newBlocks.find((b) => b.id === modification.blockId);
          const diff = modification.undoDifferences(b.data);
          if (diff) {
            newBlocks[newBlocks.indexOf(b)].data = diff;
          }
          break;
        case TeRichTextModificationType.DELETED:
          const block: TeBlock = {
            id: modification.blockId,
            data: modification.blockValue,
            type: modification.blockType as any,
          };
          // add the block to the index
          newBlocks.splice(modification.index, 0, block);
          break;
      }
    }
    this.richText = new TeRichText({
      version: this.richText.version,
      editorVersion: this.richText.editorVersion,
      blocks: newBlocks,
    });

    this.modifications.removeModificationsAfterUndo(modificationId);
  }

  // Redo the modifications in the modificationsList
  public redoLastModification(): TeRichTextBlockModification {
    const blocks = this.richText.getBlocks();

    const modification = this.modifications.getLastRedoModification();
    if (!modification) return null;

    switch (modification.type) {
      case TeRichTextModificationType.MOVED:
        const movedBlock: TeBlock = {
          id: modification.blockId,
          data: modification.blockValue,
          type: modification.blockType as any,
        };
        blocks.splice(modification.oldIndex, 1);
        blocks.splice(modification.index, 0, movedBlock);
        break;
      case TeRichTextModificationType.CREATED:
        const block: TeBlock = {
          id: modification.blockId,
          data: modification.blockValue,
          type: modification.blockType as any,
        };
        blocks.splice(modification.index, 0, block);
        break;
      case TeRichTextModificationType.UPDATED:
        const diff = modification.redoDifferences(blocks[modification.index].data);
        if (diff) {
          blocks[modification.index].data = diff;
        }
        break;
      case TeRichTextModificationType.DELETED:
        blocks.splice(modification.index, 1);
        break;
    }

    this.richText = new TeRichText({
      version: this.richText.version,
      editorVersion: this.richText.editorVersion,
      blocks: blocks,
    });

    this.modifications.removeLastRedoModification();
    // re-add the modification to the list
    this.modifications.addModification(modification);

    return modification;
  }

  public async getModificationsDTO(
    getUser: TeRichTextGetUserFunction
  ): Promise<TeRichTextBlockModificationWithUser[]> {
    return this.modifications.toModificationsDTO(getUser);
  }

  public getModificationsAsString(): string {
    return this.modifications?.toJsonString() ?? '';
  }

  ///////////////////////////////// OTHERS /////////////////////////////////

  public toJson(): TeNewFullRichTextDTO {
    return {
      version: this.version,
      richText: this.richText.toJson(),
      modifications: this.modifications?.toJsonObject(),
    };
  }
}
