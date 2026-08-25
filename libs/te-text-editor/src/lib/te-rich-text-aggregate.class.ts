import { ClStringHelper } from '@monorepo/core-lib';

import { TeBlock, TeBlockType } from './te-block.class';
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
 * A block and the index it is known to hold in one version of the document.
 */
interface TePositionedBlock {
  index: number;
  block: TeBlock;
}

/**
 * Full stored rich text content, if the migration is done, it will be TeNewFullRichTextContent
 * otherwise it will be TeRichTextContent
 */
export type TeRichTextAggregateJsonInput =
  TeHTMLEditorJSON | TeOldRichTextContentWithModificationsI | TeNewFullRichTextDTO;

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

    // Assign a common groupId to all modifications from the same user action
    const modifications = newModifications.getModifications();
    if (modifications.length > 1) {
      const groupId = ClStringHelper.generateUUID();
      for (const modification of modifications) {
        modification.groupId = groupId;
      }
    }

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
    const movedBlockIds = this.getMovedBlockIds(newRichText);

    // find deleted blocks, start by the last block.
    // On a copy: `getBlocks()` hands out the internal array, and reversing it in place would
    // reverse the old document itself — which the second loop below then reads through
    // `getBlockIndex` to decide what moved. Every `oldIndex` came out mirrored, so a reorder was
    // recorded against the wrong block, or (for two blocks) not recorded at all.
    let index = this.richText.getBlocks().length - 1;
    for (const oldBlock of [...this.richText.getBlocks()].reverse()) {
      if (oldBlock.id == null) {
        index--;
        continue;
      }
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
      if (block.id == null) {
        index++;
        continue;
      }
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
        index++;
        continue;
      }

      if (
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
        if (modif.blockType == TeBlockType.LIST) {
          if ('meta' in block.data) delete block.data['meta'];
          if ('meta' in oldBlock.data) delete oldBlock.data['meta'];
        }

        modif.blockValue = block.data;
        // get the differences between the old block data and the new block data,
        // we stringify the data to compare them as string with the lib diff
        modif.setDifferences(oldBlock.data);
        differences.push(modif);
      }

      // a block can be dragged and typed into in the same save: the edit used to hide the move, so
      // the undo restored the text and left the block where the drag had put it
      if (movedBlockIds.has(block.id)) {
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
   * The blocks the user actually moved, as opposed to those whose index merely shifted because a
   * block above them was deleted or inserted. A raw index comparison cannot tell the two apart, so
   * it used to report a deletion as "you moved the 40 blocks below it" — which is why the history
   * threw every MOVED away as soon as the save contained anything else, and why undoing such a
   * save did not restore the order.
   *
   * The decision is taken on the order of the blocks *present in both versions*: the longest run of
   * them that kept its relative order is considered to have stayed put, and everything else is a
   * real move. A shift suffered from above leaves that relative order intact, so it names nobody.
   */
  private getMovedBlockIds(newRichText: TeRichText): Set<string> {
    const commonBlocks: { id: string; oldIndex: number }[] = [];
    for (const block of newRichText.getBlocks()) {
      if (block.id == null) continue;
      const oldIndex = this.richText.getBlockIndex(block.id);
      if (oldIndex !== -1) {
        commonBlocks.push({ id: block.id, oldIndex });
      }
    }

    const stayedPut = new Set(
      TeRichTextAggregate.longestIncreasingSubsequence(
        commonBlocks.map((commonBlock) => commonBlock.oldIndex)
      ).map((position) => commonBlocks[position].id)
    );

    return new Set(
      commonBlocks.filter((commonBlock) => !stayedPut.has(commonBlock.id)).map((block) => block.id)
    );
  }

  /**
   * Positions of a longest strictly increasing subsequence of `values`, in order.
   * Patience sorting: `tails[k]` holds the position of the smallest possible tail of an increasing
   * subsequence of length k + 1, and `previous` remembers what each position extended.
   */
  private static longestIncreasingSubsequence(values: number[]): number[] {
    const tails: number[] = [];
    const previous: number[] = new Array(values.length).fill(-1);

    for (let position = 0; position < values.length; position++) {
      let low = 0;
      let high = tails.length;
      while (low < high) {
        const middle = (low + high) >> 1;
        if (values[tails[middle]] < values[position]) {
          low = middle + 1;
        } else {
          high = middle;
        }
      }
      previous[position] = low > 0 ? tails[low - 1] : -1;
      tails[low] = position;
    }

    const subsequence: number[] = [];
    let position = tails.length > 0 ? tails[tails.length - 1] : -1;
    while (position !== -1) {
      subsequence.unshift(position);
      position = previous[position];
    }
    return subsequence;
  }

  private static blockFromModification(modification: TeRichTextBlockModification): TeBlock {
    return {
      id: modification.blockId,
      data: modification.blockValue,
      type: modification.blockType,
    };
  }

  /**
   * Place blocks known by an absolute index at that index, then let the blocks that stayed put fill
   * what is left, in their own order. Splicing modification by modification cannot rebuild a mixed
   * save: a DELETED is indexed on the old document while a MOVED or a CREATED is indexed on the new
   * one, so each splice invalidates the index of the next.
   */
  private static placeBlocks(
    length: number,
    positioned: TePositionedBlock[],
    stayedPut: TeBlock[]
  ): TeBlock[] {
    const result: (TeBlock | undefined)[] = new Array(length);
    for (const { index, block } of positioned) {
      result[index] = block;
    }

    let next = 0;
    for (let position = 0; position < result.length; position++) {
      if (result[position] === undefined && next < stayedPut.length) {
        result[position] = stayedPut[next++];
      }
    }

    // anything left over kept its relative order too — appending it never loses a block
    return [...result, ...stayedPut.slice(next)].filter((block): block is TeBlock => block !== undefined);
  }

  /**
   * Rebuild the document a save started from: every block of the old document is put back by the
   * coordinates it is known by — a deleted block by its old index, a moved block by the index it
   * came from — and the blocks the save left in place fill the rest.
   */
  private static undoGroup(blocks: TeBlock[], group: TeRichTextBlockModification[]): TeBlock[] {
    const created = group.filter((mod) => mod.type === TeRichTextModificationType.CREATED);
    const deleted = group.filter((mod) => mod.type === TeRichTextModificationType.DELETED);
    const moved = group.filter((mod) => mod.type === TeRichTextModificationType.MOVED);
    const updated = group.filter((mod) => mod.type === TeRichTextModificationType.UPDATED);

    // drop what the save created, and put back the content it changed
    const survivors = blocks
      .filter((block) => !created.some((mod) => mod.blockId === block.id))
      .map((block) => {
        const modification = updated.find((mod) => mod.blockId === block.id);
        if (!modification) return block;
        const data = modification.undoDifferences(block.data);
        return data ? { ...block, data } : block;
      });

    const positioned = deleted.map((mod) => ({
      index: mod.index,
      block: TeRichTextAggregate.blockFromModification(mod),
    }));
    for (const modification of moved) {
      if (modification.oldIndex == null) {
        throw new Error('Cannot undo a moved modification without an old index');
      }
      positioned.push({
        index: modification.oldIndex,
        // the survivor carries the content as it stands now, the modification only knows where it was
        block:
          survivors.find((block) => block.id === modification.blockId) ??
          TeRichTextAggregate.blockFromModification(modification),
      });
    }

    const movedIds = new Set<string | undefined>(moved.map((mod) => mod.blockId));
    return TeRichTextAggregate.placeBlocks(
      survivors.length + deleted.length,
      positioned,
      survivors.filter((block) => !movedIds.has(block.id))
    );
  }

  /**
   * Replay a save, the mirror of `undoGroup`: the blocks it created and moved go to the index they
   * hold in the document the save produced, and the ones it left alone fill the rest.
   */
  private static redoGroup(blocks: TeBlock[], group: TeRichTextBlockModification[]): TeBlock[] {
    const created = group.filter((mod) => mod.type === TeRichTextModificationType.CREATED);
    const deleted = group.filter((mod) => mod.type === TeRichTextModificationType.DELETED);
    const moved = group.filter((mod) => mod.type === TeRichTextModificationType.MOVED);
    const updated = group.filter((mod) => mod.type === TeRichTextModificationType.UPDATED);

    // re-apply the content the save changed, and drop what it deleted
    const survivors = blocks
      .filter((block) => !deleted.some((mod) => mod.blockId === block.id))
      .map((block) => {
        const modification = updated.find((mod) => mod.blockId === block.id);
        if (!modification) return block;
        const data = modification.redoDifferences(block.data);
        return data ? { ...block, data } : block;
      });

    const positioned = created.map((mod) => ({
      index: mod.index,
      block: TeRichTextAggregate.blockFromModification(mod),
    }));
    for (const modification of moved) {
      positioned.push({
        index: modification.index,
        block:
          survivors.find((block) => block.id === modification.blockId) ??
          TeRichTextAggregate.blockFromModification(modification),
      });
    }

    const movedIds = new Set<string | undefined>(moved.map((mod) => mod.blockId));
    return TeRichTextAggregate.placeBlocks(
      survivors.length + created.length,
      positioned,
      survivors.filter((block) => !movedIds.has(block.id))
    );
  }

  /**
   * Undo the last modification group (useful for the ctrl+z).
   * Returns all undone modifications.
   */
  public undoLastModification(): TeRichTextBlockModification[] {
    const firstOfGroup = this.modifications.getFirstModificationOfLastGroup();
    if (!firstOfGroup) return [];

    // Get the group before it's moved to redo
    const undoneModifications = this.modifications.getModificationsFromModificationId(firstOfGroup.id);
    this.undoModifications(firstOfGroup.id);
    return undoneModifications;
  }

  // Undo the modifications in the modificationsList
  public undoModifications(modificationId: string): void {
    // a save is atomic, so an id naming its second row still undoes that save whole
    const firstOfGroup = this.modifications.getFirstModificationOfGroup(modificationId);

    // one save at a time, most recent first: each save's indexes are written against the document
    // that save produced, so they only mean anything once the saves after it have been undone
    let blocks = [...this.richText.getBlocks()];
    for (const group of this.modifications.getGroupsFromModificationId(firstOfGroup.id).reverse()) {
      blocks = TeRichTextAggregate.undoGroup(blocks, group);
    }

    this.richText = new TeRichText({
      version: this.richText.version,
      editorVersion: this.richText.editorVersion,
      blocks: blocks,
    });

    this.modifications.removeModificationsAfterUndo(firstOfGroup.id);
  }

  // Redo the last modification group
  public redoLastModification(): TeRichTextBlockModification[] {
    const group = this.modifications.getLastRedoGroup();
    if (group.length === 0) return [];

    const blocks = TeRichTextAggregate.redoGroup([...this.richText.getBlocks()], group);

    this.richText = new TeRichText({
      version: this.richText.version,
      editorVersion: this.richText.editorVersion,
      blocks: blocks,
    });

    this.modifications.removeLastRedoGroup();
    // re-add the modifications to the list
    for (const modification of group) {
      this.modifications.addModification(modification);
    }

    return group;
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
