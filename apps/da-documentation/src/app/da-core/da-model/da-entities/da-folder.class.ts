import {DaEntity} from './da-entity.class';
import {DaVersion} from './da-version.class';
import {DaDocumentation} from './da-documentation.class';

export class DaFolder extends DaEntity{

  title: string;

  version: DaVersion;

  path: string;

  completePath: string;

  order: number;

  folder: DaFolder;

  folders: DaFolder[];

  documentations: DaDocumentation[];

}

export class DaFolderDTO extends DaEntity{

  title: string;

  path: string;

  folderId: string;

  order: number;

}
