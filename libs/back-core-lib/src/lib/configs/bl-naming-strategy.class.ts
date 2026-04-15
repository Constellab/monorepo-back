import { DefaultNamingStrategy, Table } from 'typeorm';

export class BlNamingStrategy extends DefaultNamingStrategy {
  foreignKeyName(tableOrName: Table | string, columnNames: string[]): string {
    const tableName = typeof tableOrName === 'string' ? tableOrName : tableOrName.name;
    return `FK_${tableName}_${columnNames.join('_')}`;
  }
}
