import {HaEntity} from './ha-entity.class';
import {HaVersion} from './ha-version.class';
import {HaDocumentation} from './ha-documentation.class';
import {Type} from 'class-transformer';

export class HaFolder extends HaEntity {

  title: string;

  @Type(() => HaVersion)
  version: HaVersion;

  path: string;

  completePath: string;

  order: number;

  @Type(() => HaFolder)
  folder: HaFolder;

  @Type(() => HaFolder)
  folders: HaFolder[];

  @Type(() => HaDocumentation)
  documentations: HaDocumentation[];

}

export class HaFolderDTO extends HaEntity {

  title: string;

  path: string;

  folderId: string;

  order: number;

}
