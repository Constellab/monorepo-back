import { Duration } from 'luxon';

import { TeRichTextBlockModification } from './te-rich-text-block-modification.class';
import {
  TeRichTextBlockModificationsDTO,
  TeRichTextBlockModificationWithUser,
  TeRichTextGetUserFunction,
} from './te-rich-text-block-modification.dto';
import { TeRichTextMigrator } from './te-rich-text-migrator.class';
import { TeUser } from './te-user.class';

export class TeRichTextModifications {
  private static readonly CURRENT_VERSION = 2;
  private static readonly FRONT_TIME_DIFFERENCE = Duration.fromObject({ seconds: 5 });
  private static readonly BACK_TIME_DIFFERENCE = Duration.fromObject({ minutes: 3 });
  private static MAX_TIME_DIFFERENCE: Duration | null = null;

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
    return TeRichTextModifications.fromJsonObject(json);
  }

  public static fromJsonObject(
    json: TeRichTextBlockModificationsDTO | null | undefined,
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
    this.modifications = modifications || [];
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
    const modificationsList = modifications.modifications;
    if (this.isEmpty()) {
      this.modifications = modificationsList;
      return;
    }

    if (modificationsList.length === 0) {
      return;
    }

    this.modifications.push(...modificationsList);
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

  /**
   * Get the first modification of the last group.
   * If the last modification has a groupId, returns the first modification with the same groupId.
   * Otherwise, returns the last modification (single modification without group).
   */
  public getFirstModificationOfLastGroup(): TeRichTextBlockModification | null {
    const last = this.getLastModification();
    if (!last) return null;
    if (!last.groupId) return last;

    for (let i = 0; i < this.modifications.length; i++) {
      if (this.modifications[i].groupId === last.groupId) {
        return this.modifications[i];
      }
    }
    return last;
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

  /**
   * Get the last redo group (all modifications at the end of redoModifications with the same groupId).
   * If the last redo modification has no groupId, returns an array with just that modification.
   */
  public getLastRedoGroup(): TeRichTextBlockModification[] {
    const last = this.getLastRedoModification();
    if (!last) return [];
    if (!last.groupId) return [last];

    const group: TeRichTextBlockModification[] = [];
    for (let i = this.redoModifications.length - 1; i >= 0; i--) {
      if (this.redoModifications[i].groupId === last.groupId) {
        group.unshift(this.redoModifications[i]);
      } else {
        break;
      }
    }
    return group;
  }

  public removeLastRedoGroup(): void {
    const group = this.getLastRedoGroup();
    this.redoModifications.splice(this.redoModifications.length - group.length, group.length);
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
      let user = userMap.get(modification.userId);
      if (!user) {
        user = await getUser(modification.userId);
        userMap.set(modification.userId, user);
      }
      res.push(TeRichTextBlockModificationWithUser.fromBlockModification(modification, user));
    }
    return res;
  }
}
