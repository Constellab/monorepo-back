import { TeRichTextMigrator } from './te-rich-text-migrator.class';
import { TeBlockType } from './te-block.class';
import {
  TeRichTextBlockModificationWithUser,
  TeRichTextBlockModificationsDTO,
  TeRichTextGetUserFunction,
} from './te-rich-text-block-modification.dto';
import {
  TeRichTextBlockModification,
  TeRichTextModificationType,
} from './te-rich-text-block-modification.class';
import { Duration } from 'luxon';
import { TeUser } from './te-user.class';

export class TeRichTextModifications {
  private static readonly CURRENT_VERSION = 2;
  private static readonly FRONT_TIME_DIFFERENCE = Duration.fromObject({ seconds: 10 });
  private static readonly BACK_TIME_DIFFERENCE = Duration.fromObject({ minutes: 3 });
  private static MAX_TIME_DIFFERENCE: Duration = null;

  private readonly version: number;

  private modifications: TeRichTextBlockModification[] = [];
  private redoModifications: TeRichTextBlockModification[] = [];

  // Method to configure the time difference between modifications for fusion,
  // it needs to be called before any modification
  public static setFrontTimeDifference(): void {
    TeRichTextModifications.MAX_TIME_DIFFERENCE = TeRichTextModifications.FRONT_TIME_DIFFERENCE;
  }

  public static setBackTimeDifference(): void {
    TeRichTextModifications.MAX_TIME_DIFFERENCE = TeRichTextModifications.BACK_TIME_DIFFERENCE;
  }

  // Create a TeRichTextModifications object from a json string
  public static fromJsonObjectString(jsonString: string): TeRichTextModifications {
    if (!jsonString) {
      return new TeRichTextModifications();
    }
    const json = JSON.parse(jsonString);
    return new TeRichTextModifications(json);
  }

  public static fromJsonObject(
    json: TeRichTextBlockModificationsDTO,
    targetVersion: number = TeRichTextModifications.CURRENT_VERSION
  ): TeRichTextModifications {
    if (!json) {
      return new TeRichTextModifications();
    }

    json = this.migrate(json, targetVersion);

    const modifications = json.modifications.map((modification) =>
      TeRichTextBlockModification.fromJsonObject(modification)
    );

    return new TeRichTextModifications(modifications, json.version);
  }

  private static migrate(
    modifications: TeRichTextBlockModificationsDTO,
    targetVersion: number
  ): TeRichTextBlockModificationsDTO {
    const migrators = TeRichTextMigrator.getMigrators(modifications.version, targetVersion);
    for (const migrator of migrators) {
      modifications = migrator.migrateModifications(modifications);
    }
    return modifications;
  }

  constructor(
    modifications: TeRichTextBlockModification[] = [],
    version: number = TeRichTextModifications.CURRENT_VERSION
  ) {
    this.modifications = modifications;
    this.version = version;
  }

  public getModifications(): TeRichTextBlockModification[] {
    return this.modifications;
  }

  public isEmpty(): boolean {
    return this.modifications?.length === 0;
  }

  // fusion old and new modifications
  public fusion(modifications: TeRichTextModifications): void {
    // clear the redo array because this is a modification
    this.resetRedoModifications();

    let modificationsList = this.reduceModifications(modifications.modifications);

    if (this.isEmpty()) {
      this.modifications = modificationsList;
      return;
    }

    if (modificationsList.length === 0) {
      return;
    }
    const lastModification = this.modifications[this.modifications.length - 1];

    if (modificationsList.length > 1) {
      // first modif should be the one with the same block id as the last this.modification block id,
      // or it doesn't matter
      modificationsList = modificationsList.sort((a, b) => {
        if (a.blockId === lastModification.blockId) {
          return -1;
        }
        if (b.blockId === lastModification.blockId) {
          return 1;
        }
        return 0;
      });
    }

    for (const modification of modificationsList) {
      // if the last modification is a move and the current one is a move on the same block,
      // we keep the fusion of the two moves
      if (
        lastModification?.type == TeRichTextModificationType.MOVED &&
        modification.type == TeRichTextModificationType.MOVED &&
        lastModification?.blockId == modification.blockId
      ) {
        modification.oldIndex = lastModification.oldIndex;
        this.modifications.splice(this.modifications.length - 1, 1);
        if (modification.oldIndex == modification.index) {
          continue;
        }
      }

      // if the last modification is a move and the current one is a move on the same block,
      // we keep the fusion of the two moves
      if (
        modification.blockId == lastModification?.blockId &&
        lastModification.time.plus(TeRichTextModifications.MAX_TIME_DIFFERENCE) > modification.time
      ) {
        if (
          modification.type == TeRichTextModificationType.UPDATED &&
          modification.userId === lastModification.userId
        ) {
          // if the last modification is a creation and the current one is an update on the same block,
          // otherwise we keep the fusion as a update
          // we keep the fusion of the two modifications has a creation
          if (lastModification.type === TeRichTextModificationType.CREATED) {
            modification.type = TeRichTextModificationType.CREATED;
            modification.differences = null;
          } else if (lastModification.type === TeRichTextModificationType.UPDATED) {
            modification.differences = lastModification.differences.concat(
              ...modification.differences.slice().reverse()
            );
            modification.blockValue = null;
          }
          this.modifications.splice(this.modifications.length - 1, 1, modification);
          continue;
        }

        if (modification.type == TeRichTextModificationType.DELETED) {
          if (lastModification.type == TeRichTextModificationType.CREATED) {
            this.modifications.splice(this.modifications.length - 1, 1);
          }
          if (
            lastModification.type == TeRichTextModificationType.CREATED ||
            (lastModification.blockType === TeBlockType.PARAGRAPH &&
              lastModification.blockValue?.text &&
              lastModification.blockValue?.text == '/')
          ) {
            continue;
          }
        }
      }

      if (modification.type == TeRichTextModificationType.UPDATED) {
        modification.blockValue = null;
      }
      this.modifications.push(modification);
    }
  }

  // Reduce the new modifications array to keep only the important ones
  private reduceModifications(modifications: TeRichTextBlockModification[]): TeRichTextBlockModification[] {
    const areAllMoved = modifications.every(
      (modification) => modification.type === TeRichTextModificationType.MOVED
    );
    const numMoved = modifications.filter(
      (modification) => modification.type === TeRichTextModificationType.MOVED
    ).length;
    if (numMoved == 1) {
      modifications = modifications.filter(
        (modification) => modification.type !== TeRichTextModificationType.MOVED
      );
    }
    if (areAllMoved) {
      let moveModification: TeRichTextBlockModification = null;
      modifications.forEach((modification) => {
        const movement = Math.abs(modification.index - modification.oldIndex);
        const currentMovement = moveModification
          ? Math.abs(moveModification.index - moveModification.oldIndex)
          : 0;
        if (
          moveModification == null ||
          movement > currentMovement ||
          JSON.stringify(moveModification.blockValue).length < JSON.stringify(modification.blockValue).length
        ) {
          moveModification = modification;
        }
      });
      if (moveModification) {
        return [moveModification];
      } else {
        return [];
      }
    }
    modifications = modifications.filter(
      (m) => JSON.stringify(m.blockValue) != '{"text":"/"}' && m.type !== TeRichTextModificationType.MOVED
    );

    return modifications;
  }

  public toJsonObject(): TeRichTextBlockModificationsDTO {
    return {
      version: this.version,
      modifications: this.modifications.map((modification) => modification.toJsonObject()),
    };
  }

  public toJsonString(): string {
    return JSON.stringify(this.toJsonObject());
  }

  // Get the modification with the modificationId with all modifications made after
  public getModificationsFromModificationId(modificationId: string): TeRichTextBlockModification[] {
    const modification = this.modifications.find((modification) => modification.id === modificationId);
    if (!modification) {
      throw new Error('Modification not found');
    }
    const modificationIndex = this.modifications.indexOf(modification);
    // create a copy of the array
    const res: TeRichTextBlockModification[] = this.modifications.slice(modificationIndex);
    if (!res || res.length == 0) {
      throw new Error('No modifications found');
    }
    return res;
  }

  // Delete all modifications made after the modification with the modificationId
  public removeModificationsAfterUndo(modificationId: string): number {
    const baseModificationsLength = this.modifications.length;
    const modification = this.modifications.find((modification) => modification.id === modificationId);
    if (!modification) {
      throw new Error('Modification not found');
    }
    const modificationIndex = this.modifications.indexOf(modification);
    const modificationToRedo = this.modifications.slice(modificationIndex);
    this.addRedoModifications(modificationToRedo);
    this.modifications = this.modifications.slice(0, modificationIndex);
    return baseModificationsLength - this.modifications.length;
  }

  public getLastModification(): TeRichTextBlockModification | null {
    return this.modifications[this.modifications.length - 1];
  }

  public addModification(modification: TeRichTextBlockModification): void {
    this.modifications.push(modification);
  }

  private addRedoModifications(modifications: TeRichTextBlockModification[]): void {
    this.redoModifications.push(...modifications);
  }

  public removeLastRedoModification(): void {
    this.redoModifications.pop();
  }

  public getLastRedoModification(): TeRichTextBlockModification | null {
    if (this.redoModifications.length == 0) return null;
    return this.redoModifications[this.redoModifications.length - 1];
  }

  private resetRedoModifications(): void {
    this.redoModifications = [];
  }

  /**
   * Method to convert the modifications to a DTO that include the user information
   * @param getUser method to get the user information
   */
  public async toModificationsDTO(
    getUser: TeRichTextGetUserFunction
  ): Promise<TeRichTextBlockModificationWithUser[]> {
    if (!this.modifications) return [];
    const res: TeRichTextBlockModificationWithUser[] = [];

    // map to store loaded users
    const userMap = new Map<string, TeUser>();
    for (const modification of this.getModifications()) {
      if (!userMap.has(modification.userId)) {
        const userDto = await getUser(modification.userId);
        userMap.set(modification.userId, userDto);
      }
      res.push(
        TeRichTextBlockModificationWithUser.fromBlockModification(modification, userMap.get(modification.userId))
      );
    }
    return res;
  }
}
