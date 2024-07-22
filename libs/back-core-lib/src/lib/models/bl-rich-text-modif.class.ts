import {ClStringHelper} from '@monorepo/core-lib';
import {diffChars} from 'diff';
import {BlUserDto} from './bl-user/bl-user.class';

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

export class BlRichTextBlockModification {

  id: string;

  version: string;

  time: number;

  blockId: string;

  blockType: string;

  differences?: BlRichTextModificationDifference[];

  blockValue?: Record<string, any>

  type: BlRichTextModificationType;

  index: number;

  userId: string;

  user?: BlUserDto;

  oldIndex?: number;

  constructor(version: string, blockId: string, blockType: string, type: BlRichTextModificationType, index: number,
              userId: string, id?: string, time?: number) {
    this.id = id ?? ClStringHelper.generateUUID();
    this.version = version;
    this.time = time ?? new Date().getTime();
    this.blockId = blockId;
    this.blockType = blockType;
    this.type = type;
    this.index = index;
    this.userId = userId;
  }
}

export class BlRichTextModifications {
  private version: string = '1.0.0';

  private modifications: BlRichTextBlockModification[] = [];


  // Create a BlRichTextModifications object from a json string
  public static fromJsonObjectString(jsonString: string): BlRichTextModifications {
    const modifications = new BlRichTextModifications();
    const json = JSON.parse(jsonString);
    if (!json) {
      return modifications;
    }
    modifications.setVersion(json.version);
    modifications.setModifications(json.modifications.map((modification: Record<string, any>) => {
      const modif = new BlRichTextBlockModification(
        modification.version,
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
      if (modification.user) {
        modif.user = modification.user;
      }
      if (modification.oldIndex) {
        modif.oldIndex = modification.oldIndex;
      }
      return modif;
    }));
    return modifications;
  }


  // Get the differences between two strings with the lib diff
  public static getValuesDifferences(oldValue: string, newValue: string): BlRichTextModificationDifference[] {
    const res: BlRichTextModificationDifference[] = []
    const changes = diffChars(oldValue, newValue);
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
    return res;
  }


  // Undo the differences found with the lib diff
  public static undoDifferences(value: string, differences: BlRichTextModificationDifference[]): string {
    let res = value;
    const reversedDifferences = differences.slice().reverse();
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
  public static redoDifferences(value: string, differences: BlRichTextModificationDifference[]): string {
    let res = value;
    for (const diff of differences) {
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

  public getVersion(): string {
    return this.version;
  }

  public getModifications(): BlRichTextBlockModification[] {
    return this.modifications;
  }

  public setVersion(value: string): void {
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

    modifications = modifications.filter((m) => JSON.stringify(m.blockValue) != '{"text":"/"}');
    return modifications;
  }

  // fusion old and new modifications
  public fusion(modifications: BlRichTextBlockModification[]): void {

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
      if (modification.blockId == lastModification?.blockId && lastModification.time + 3 * 60 * 1000 > modification.time) {
        if (modification.type == BlRichTextModificationType.UPDATED && modification.userId === lastModification.userId) {
          // if the last modification is a creation and the current one is an update on the same block, otherwise we keep the fusion as a update
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
          this.modifications.splice(this.modifications.length - 1, 1);
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
        version: modification.version,
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

  // Get the modification with the modificationId with all modifications made after
  public getModificationsFromModificationId(modificationId: string): BlRichTextBlockModification[] {
    const modification = this.modifications.find(modification => modification.id === modificationId);
    if (!modification) {
      throw new Error('Modification not found');
    }
    const modificationIndex = this.modifications.indexOf(modification);
    return this.modifications.slice(modificationIndex);
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
