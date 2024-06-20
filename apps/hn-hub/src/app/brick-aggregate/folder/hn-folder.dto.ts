import {BlEntityWithId} from '@monorepo/back-core-lib';
import {HnFolder} from './hn-folder.entity';
import {HnBaseDto} from '../../core/model/entities/hn-base.dto';
import {HnBrickMajorVersionDTO} from '../brick-major-version/hn-brick-major-version.dto';
import {HnDocumentationDto} from '../documentation/hn-documentation.dto';

export class HnFolderDto extends HnBaseDto{
  title: string;
  brickMajorVersion: HnBrickMajorVersionDTO;
  path: string;
  completePath: string;
  order: number;
  folder?: HnFolderDto;
  folders?: HnFolderDto[];
  documentations?: HnDocumentationDto[];

  constructor(folder: HnFolder) {
    super(folder);
    this.title = folder.title;
    this.brickMajorVersion = new HnBrickMajorVersionDTO(folder.brickMajorVersion);
    this.path = folder.path;
    this.completePath = folder.completePath;
    this.order = folder.order;
    if (folder.folder) {
      this.folder = new HnFolderDto(folder.folder);
    }
    if (folder.folders) {
      this.folders = folder.folders.map(f => new HnFolderDto(f));
    }
    if (folder.documentations) {
      this.documentations = folder.documentations.map(d => new HnDocumentationDto(d));
    }
  }
}

export class HnNode extends BlEntityWithId {
  name: string;

  order: number;

  path: string;

  completePath: string;

  parentId: string;

  children?: HnNode[];

  constructor(id: string, name: string, path: string, completePath: string, o: number, parentId?: string, children?: HnNode[]) {
    super();
    this.id = id;
    this.name = name;
    this.order = o;
    this.path = path;
    this.parentId = parentId ? parentId : null;
    this.completePath = completePath;
    if (children && children.length > 0) {
      this.children = children;
    }
  }
}

export class HnNodeDTO extends BlEntityWithId {
  title: string;
  path: string;
  folder?: HnFolder;
  folderId?: string;
  isFolder: boolean;
  order?: number;
}
