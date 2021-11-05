import {DaEntity} from './da-entity.class';
import {DaVersion} from './da-version.class';
import {DaDocumentation} from './da-documentation.class';

export class DaFolder extends DaEntity{

  title: string;

  version: DaVersion;

  path: string;

  order: number;

  folder: DaFolder;

  folders: DaFolder[];

  documentations: DaDocumentation[];

}
