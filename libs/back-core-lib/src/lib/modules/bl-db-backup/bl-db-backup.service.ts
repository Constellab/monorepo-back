import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { BlBucketConfig } from '../bl-object-storage/bl-object-storage.class';
import { BlObjectStorageService } from '../bl-object-storage/bl-object-storage.service';

@Injectable()
export class BlDbBackupService {


  constructor(private objectStorageService: BlObjectStorageService) {
  }

  public async backupDb(entityManager: EntityManager, bucketConfig: BlBucketConfig,
                        filename: string): Promise<void> {
    const dbJson = await this.exportDbAsJson(entityManager);

    await this.objectStorageService.uploadJson(bucketConfig, dbJson, { filename: filename });
  }

  private async exportDbAsJson(entityManager: EntityManager): Promise<any> {
    const tables = await this.getTablesNames(entityManager);

    const result = {};
    for (const table of tables) {
      result[table] = await entityManager.query('SELECT * FROM `' + table + '`');
    }

    return result;
  }

  private async getTablesNames(entityManager: EntityManager): Promise<string[]> {
    const result: Record<string, string>[] = await entityManager.query('SHOW TABLES');

    return result.map((table) => {
      return table[Object.keys(table)[0]];
    });
  }
}
