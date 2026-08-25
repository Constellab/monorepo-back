import { ClStringHelper } from '@monorepo/core-lib';
import { diffChars } from 'diff';
import { DateTime } from 'luxon';

import { TeBlockData, TeBlockType } from './te-block.class';
import { TeRichTextBlockModificationDTO } from './te-rich-text-block-modification.dto';

export enum TeRichTextModificationType {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
  MOVED = 'MOVED',
}

export interface TeRichTextModificationDifference {
  index: number;
  count: number;
  added: boolean;
  removed: boolean;
  value: string;
}

export class TeRichTextBlockModification {
  id: string;

  version!: string;

  time: DateTime;

  blockId: string;

  blockType: TeBlockType;

  differences?: TeRichTextModificationDifference[];

  blockValue?: TeBlockData;

  type: TeRichTextModificationType;

  index: number;

  userId: string;

  oldIndex?: number;

  groupId?: string;

  constructor(
    blockId: string,
    blockType: TeBlockType,
    type: TeRichTextModificationType,
    index: number,
    userId: string,
    id?: string,
    time?: string,
    groupId?: string
  ) {
    this.id = id ?? ClStringHelper.generateUUID();
    this.time = time ? DateTime.fromISO(time) : DateTime.now();
    this.blockId = blockId;
    this.blockType = blockType;
    this.type = type;
    this.index = index;
    this.userId = userId;
    this.groupId = groupId;
  }

  public static fromJsonObject(json: TeRichTextBlockModificationDTO): TeRichTextBlockModification {
    const modification = new TeRichTextBlockModification(
      json.blockId,
      json.blockType,
      json.type,
      json.index,
      json.userId,
      json.id,
      json.time,
      json.groupId
    );
    if (json.type == TeRichTextModificationType.UPDATED) {
      modification.differences = json.differences;
    } else {
      modification.blockValue = json.blockValue;
    }
    // `0` is a real index: a block dragged away from the very top of the document has an oldIndex
    // of 0, and a falsy test used to drop it on the way back in — undo then had nothing to splice on.
    if (json.oldIndex != null) {
      modification.oldIndex = json.oldIndex;
    }
    return modification;
  }

  // Set the differences between the old block data value and the new block data value, using the lib diff
  public setDifferences(oldValue: TeBlockData): void {
    const res: TeRichTextModificationDifference[] = [];
    const newValue = this.getBlockDataAsString();
    const oldValueString = TeRichTextBlockModification.stringifyBlockData(oldValue);
    const changes = diffChars(oldValueString, newValue);
    let i = 0;
    for (const change of changes) {
      if (change.added || change.removed) {
        res.push({
          index: i,
          added: change.added,
          removed: change.removed,
          value: change.value,
          count: change.count,
        });
      }
      if (!change.removed) {
        i += change.count;
      }
    }
    this.differences = res;
  }

  // Undo the differences found with the lib diff
  public undoDifferences(value: TeBlockData): TeBlockData {
    if (!this.differences || this.differences.length === 0) {
      return value;
    }
    let res = TeRichTextBlockModification.stringifyBlockData(value);

    const reversedDifferences = this.differences.slice().reverse();

    for (const diff of reversedDifferences) {
      if (diff.removed) {
        const before = res.slice(0, diff.index);
        const after = res.slice(diff.index);
        res = before + diff.value + after;
      } else if (diff.added) {
        const before = res.slice(0, diff.index);
        const after = res.slice(diff.index + diff.count);
        res = before + after;
      }
    }
    return TeRichTextBlockModification.parseBlockData(res);
  }

  // Redo the differences found with the lib diff
  public redoDifferences(value: TeBlockData): TeBlockData {
    let res = TeRichTextBlockModification.stringifyBlockData(value);
    if (!this.differences || this.differences.length === 0) {
      return value;
    }
    for (const diff of this.differences) {
      if (diff.added) {
        const before = res.slice(0, diff.index);
        const after = res.slice(diff.index);
        res = before + diff.value + after;
      } else if (diff.removed) {
        const before = res.slice(0, diff.index);
        const after = res.slice(diff.index + diff.count);
        res = before + after;
      }
    }
    return TeRichTextBlockModification.parseBlockData(res);
  }

  public getBlockDataAsString(): string {
    return TeRichTextBlockModification.stringifyBlockData(this.blockValue);
  }

  public static stringifyBlockData(data: TeBlockData | undefined): string {
    // replace &nbsp; with ' ' to avoid HTML parsing error
    // replace '\"'  with &quot; to avoid HTML parsing error
    // the removes of '"' helps the diff lib to work correctly
    return JSON.stringify(data).replace(/&nbsp;/g, ' ');
  }

  public static parseBlockData(data: string): TeBlockData {
    return JSON.parse(data);
  }

  public toJsonObject(): TeRichTextBlockModificationDTO {
    const time = this.time.toISO();
    if (time == null) {
      throw new Error('Invalid modification time, cannot serialize to ISO string');
    }
    return {
      time,
      blockId: this.blockId,
      blockType: this.blockType,
      differences: this.differences,
      blockValue: this.blockValue,
      type: this.type,
      index: this.index,
      userId: this.userId,
      id: this.id,
      oldIndex: this.oldIndex,
      groupId: this.groupId,
    };
  }
}
