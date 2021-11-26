import {DaEntity} from './da-entity.class';
import {DaVersion} from './da-version.class';
import {DaDocumentation} from './da-documentation.class';
import {Type} from 'class-transformer';

export class DaFolder extends DaEntity{

  title: string;

  @Type(() => DaVersion)
  version: DaVersion;

  path: string;

  completePath: string;

  order: number;

  @Type(() => DaFolder)
  folder: DaFolder;

  @Type(() => DaFolder)
  folders: DaFolder[];

  @Type(() => DaDocumentation)
  documentations: DaDocumentation[];

}

export class DaFolderDTO extends DaEntity{

  title: string;

  path: string;

  folderId: string;

  order: number;

}
