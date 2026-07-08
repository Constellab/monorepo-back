import { TeBlockListItem, TeBlockType } from './te-block.class';
import { TeRichTextDTO } from './te-rich-text.class';
import { TeRichTextBlockModificationsDTO } from './te-rich-text-block-modification.dto';

export abstract class TeRichTextMigrator {
  public migrateRichText(content: TeRichTextDTO): TeRichTextDTO {
    for (const block of content.blocks) {
      block.data = this.migrateBlockData(block.type, block.data);
    }

    content.version = this.getTargetVersion();

    return content;
  }

  public migrateModifications(data: TeRichTextBlockModificationsDTO): TeRichTextBlockModificationsDTO {
    for (const modification of data.modifications) {
      modification.blockValue = this.migrateBlockData(modification.blockType, modification.blockValue);
    }

    data.version = this.getTargetVersion();

    return data;
  }

  abstract migrateBlockData(blockType: TeBlockType, blockData: any): any;

  abstract getTargetVersion(): number;

  public static getMigrators(currentVersion: number, targetVersion: number): TeRichTextMigrator[] {
    if (currentVersion > targetVersion) {
      throw new Error('Cannot migrate from newer version to older version');
    }
    const migrators: TeRichTextMigrator[] = [];
    const allMigratorsSorted = [new TeRichTextMigrator1To2()];

    for (const migrator of allMigratorsSorted) {
      if (migrator.getTargetVersion() > currentVersion && migrator.getTargetVersion() <= targetVersion) {
        migrators.push(migrator);
      }
    }

    return migrators;
  }
}

// Migrate from old list item format to new list item format
export class TeRichTextMigrator1To2 extends TeRichTextMigrator {
  public migrateBlockData(blockType: TeBlockType, blockData: any): any {
    if (blockType === TeBlockType.LIST) {
      return this.migrateListItem(blockData);
    }
    return blockData;
  }

  private migrateListItem(listItem: TeBlockListItem): TeBlockListItem;
  private migrateListItem(listItem: TeBlockListItem | null): TeBlockListItem | null;
  private migrateListItem(listItem: TeBlockListItem | null): TeBlockListItem | null {
    if (listItem == null) return null;
    if (listItem.meta == null) {
      listItem.meta = {};
    }
    for (const child of listItem.items) {
      this.migrateListItem(child);
    }
    return listItem;
  }

  getTargetVersion(): number {
    return 2;
  }
}
