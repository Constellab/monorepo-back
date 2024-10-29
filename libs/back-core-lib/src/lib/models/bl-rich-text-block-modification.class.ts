import {ClStringHelper} from '@monorepo/core-lib';
import {diffChars} from 'diff';
import { DateTime, Duration } from 'luxon';

export enum BlRichTextModificationType {
  CREATED = "CREATED",
  UPDATED = "UPDATED",
  DELETED = "DELETED",
  MOVED = "MOVED"
}

export interface BlRichTextModificationDifference {
  index: number;
  count: number;
  added: boolean;
  removed: boolean;
  value: string;
}

const MAX_TIME_DIFFERENCE = Duration.fromObject({ minutes: 3 });

export class BlRichTextBlockModification {

  id: string;

  version: string;

  time: DateTime;

  blockId: string;

  blockType: string;

  differences?: BlRichTextModificationDifference[];

  blockValue?: Record<string, any>

  type: BlRichTextModificationType;

  index: number;

  userId: string;

  oldIndex?: number;

  constructor(blockId: string, blockType: string, type: BlRichTextModificationType, index: number,
              userId: string, id?: string, time?: string) {
    this.id = id ?? ClStringHelper.generateUUID();
    this.time = time ? DateTime.fromISO(time) : DateTime.now();
    this.blockId = blockId;
    this.blockType = blockType;
    this.type = type;
    this.index = index;
    this.userId = userId;
  }

  // Set the differences between the old block data value and the new block data value, using the lib diff
  public setDifferences(oldValue: string): void {
    const res: BlRichTextModificationDifference[] = []
    const newValue = this.blockValue;
    const changes = diffChars(oldValue, JSON.stringify(newValue));
    let i = 0;
    for (const change of changes) {
      if (change.added || change.removed) {
        res.push({
          index: i,
          added: change.added,
          removed: change.removed,
          value: change.value,
          count: change.count
        });
      }
      if (!change.removed) {
        i += change.count;
      }
    }
    this.differences = res;
  }

  // Undo the differences found with the lib diff
  public undoDifferences(value: string): string {
    if (!this.differences || this.differences.length === 0) {
      return value;
    }
    let res = value;
    const reversedDifferences = this.differences.slice().reverse();
    if (reversedDifferences.length === 1 && reversedDifferences[0].value == '/') {
      return res;
    }
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
    return res;
  }

  // Redo the differences found with the lib diff
  public redoDifferences(value: string): string {
    if (!this.differences || this.differences.length === 0) {
      return value;
    }
    let res = value;
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
    return res;
  }
}

export class BlRichTextModifications {
  private version: number = 1;

  private modifications: BlRichTextBlockModification[] = [];

  // Create a BlRichTextModifications object from a json string
  public static fromJsonObjectString(jsonString: string): BlRichTextModifications {
    const json = JSON.parse(jsonString);
    return BlRichTextModifications.fromJsonObject(json);
  }

  public static fromPythonJsonObject(json: Record<string, any>): BlRichTextModifications {
    const newJson = {
      version: json.version,
      modifications: json.modifications.map((modification: any) => ({
        time: DateTime.fromISO(modification.time),
        blockId: modification.block_id,
        blockType: modification.block_type,
        differences: modification.differences,
        blockValue: modification.block_value,
        type: modification.type,
        index: modification.index,
        userId: modification.user_id,
        id: modification.id,
        oldIndex: modification.old_index
      }))
    }
    return BlRichTextModifications.fromJsonObject(newJson);
  }

  public static fromJsonObject(json: Record<string, any>): BlRichTextModifications {
    const modifications = new BlRichTextModifications();
    if (!json) {
      return modifications;
    }
    modifications.setVersion(json.version);
    modifications.setModifications(json.modifications.map((modification: Record<string, any>) => {
      const modif = new BlRichTextBlockModification(
        modification.blockId,
        modification.blockType,
        modification.type,
        modification.index,
        modification.userId,
        modification.id,
        modification.time
      );
      if (modif.type == BlRichTextModificationType.UPDATED) {
        modif.differences = modification.differences;
      } else {
        modif.blockValue = modification.blockValue;
      }
      if (modification.oldIndex) {
        modif.oldIndex = modification.oldIndex;
      }
      return modif;
    }));
    return modifications;
  }

  public getVersion(): number {
    return this.version;
  }

  public getModifications(): BlRichTextBlockModification[] {
    return this.modifications;
  }

  public setVersion(value: number): void {
    this.version = value;
  }

  public setModifications(value: BlRichTextBlockModification[]): void {
    this.modifications = value;
  }

  public isEmpty(): boolean {
    return this.modifications?.length === 0;
  }

  // Reduce the new modifications array to keep only the important ones
  private reduceModifications(modifications: BlRichTextBlockModification[]) : BlRichTextBlockModification[]{
    const areAllMoved = modifications.every(modification => modification.type === BlRichTextModificationType.MOVED);
    const numMoved = modifications.filter(modification => modification.type === BlRichTextModificationType.MOVED).length;
    if(numMoved == 1){
      modifications = modifications.filter(modification => modification.type !== BlRichTextModificationType.MOVED);
    }
    if(areAllMoved){
      let moveModification: BlRichTextBlockModification = null;
      modifications.forEach(modification => {
        const movement = Math.abs(modification.index - modification.oldIndex);
        const currentMovement = moveModification ? Math.abs(moveModification.index - moveModification.oldIndex) : 0;
        if(moveModification == null || movement > currentMovement ||
          JSON.stringify(moveModification.blockValue).length < JSON.stringify(modification.blockValue).length){
          moveModification = modification;
        }
      });
      if (moveModification){
        return [moveModification];
      } else {
        return [];
      }
    }
    modifications = modifications.filter((m) => JSON.stringify(m.blockValue) != '{"text":"/"}'
      && m.type !== BlRichTextModificationType.MOVED);

    if (modifications.length == 2){
      if (modifications[0].type == BlRichTextModificationType.CREATED &&
        modifications[1].type == BlRichTextModificationType.DELETED){
        return modifications.reverse();
      }
    }

    return modifications;
  }

  // fusion old and new modifications
  public fusion(modifications: BlRichTextBlockModification[]): void {
    console.log('modifications', modifications);
    modifications = this.reduceModifications(modifications);

    if (this.isEmpty()) {
      this.modifications = modifications;
      return;
    }

    if (modifications.length === 0) {
      return;
    }
    const lastModification = this.modifications[this.modifications.length - 1];

    if (modifications.length > 1) {
      // first modif should be the one with the same block id as the last this.modification block id, or it doesn't matter
      modifications = modifications.sort((a, b) => {
        if (a.blockId === lastModification.blockId) {
          return -1;
        }
        if (b.blockId === lastModification.blockId) {
          return 1;
        }
        return 0;
      });
    }

    for (const modification of modifications) {
      // if the last modification is a move and the current one is a move on the same block, we keep the fusion of the two moves
      if (lastModification?.type == BlRichTextModificationType.MOVED && modification.type == BlRichTextModificationType.MOVED
        && lastModification?.blockId == modification.blockId) {
        modification.oldIndex = lastModification.oldIndex;
        this.modifications.splice(this.modifications.length - 1, 1);
        if (modification.oldIndex == modification.index){
          continue;
        }
      }

      // if the last modification is a move and the current one is a move on the same block, we keep the fusion of the two moves
      if (modification.blockId == lastModification?.blockId && lastModification.time.plus(MAX_TIME_DIFFERENCE) > modification.time) {
        if (modification.type == BlRichTextModificationType.UPDATED && modification.userId === lastModification.userId) {
          // if the last modification is a creation and the current one is an update on the same block,
          // otherwise we keep the fusion as a update
          // we keep the fusion of the two modifications has a creation
          if (lastModification.type === BlRichTextModificationType.CREATED) {
            modification.type = BlRichTextModificationType.CREATED;
            modification.differences = null;
          } else if (lastModification.type === BlRichTextModificationType.UPDATED) {
            modification.differences = lastModification.differences.concat(...modification.differences.slice().reverse());
            modification.blockValue = null;
          }
          this.modifications.splice(this.modifications.length - 1, 1, modification);
          continue;
        }

        if (modification.type == BlRichTextModificationType.DELETED) {
          if(lastModification.type == BlRichTextModificationType.CREATED){
            this.modifications.splice(this.modifications.length - 1, 1);
          }
          if (lastModification.type == BlRichTextModificationType.CREATED ||
            (lastModification.blockType == 'paragraph' &&
              lastModification.blockValue?.text && lastModification.blockValue?.text == '/')) {
            continue;
          }
        }
      }

      if (modification.type == BlRichTextModificationType.UPDATED) {
        modification.blockValue = null;
      }
      this.modifications.push(modification);
    }
  }

  public toJsonObject(): Record<string, any> {
    return {
      version: this.version,
      modifications: this.modifications.map(modification => ({
        time: modification.time,
        blockId: modification.blockId,
        blockType: modification.blockType,
        differences: modification.differences,
        blockValue: modification.blockValue,
        type: modification.type,
        index: modification.index,
        userId: modification.userId,
        id: modification.id,
        oldIndex: modification.oldIndex
      }))
    };
  }

  public toPythonJsonObject(): Record<string, any>{
    return {
      version: this.version,
      modifications: this.modifications.map(modification => ({
        time: modification.time.toISO(),
        block_id: modification.blockId,
        block_type: modification.blockType,
        differences: modification.differences,
        block_value: modification.blockValue,
        type: modification.type,
        index: modification.index,
        user_id: modification.userId,
        id: modification.id,
        old_index: modification.oldIndex
      }))
    };
  }

  // Get the modification with the modificationId with all modifications made after
  public getModificationsFromModificationId(modificationId: string): BlRichTextBlockModification[] {
    const modification = this.modifications.find(modification => modification.id === modificationId);
    if (!modification) {
      throw new Error('Modification not found');
    }
    const modificationIndex = this.modifications.indexOf(modification);
    const res: BlRichTextBlockModification[] = this.modifications.slice(modificationIndex);
    if (!res || res.length == 0){
      throw new Error('No modifications found');
    }
    if (
      res.length == 1 &&
      res[0].type != BlRichTextModificationType.DELETED &&
      res[0].type != BlRichTextModificationType.MOVED
    ) {
      return [];
    }
    if (
      res[0].type == BlRichTextModificationType.CREATED ||
      res[0].type == BlRichTextModificationType.UPDATED
    ) {
      return res.slice(1);
    }
    return res;
  }

  // Delete all modifications made after the modification with the modificationId
  public removeModificationsFromModificationId(modificationId: string): number {
    const baseModificationsLength = this.modifications.length;
    const modification = this.modifications.find(modification => modification.id === modificationId);
    if (!modification) {
      throw new Error('Modification not found');
    }
    const modificationIndex = this.modifications.indexOf(modification);
    this.modifications = this.modifications.slice(0, modificationIndex+1);
    return baseModificationsLength - this.modifications.length;
  }
}
