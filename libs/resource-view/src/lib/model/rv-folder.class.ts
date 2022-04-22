import {RvResourceViewBase} from './rv-resource-view.class';

export interface RvResourceViewFolder extends RvResourceViewBase {
  type: 'folder-view',
  data: RvResourceViewFolderData
}

export interface RvResourceViewFolderData {
  path: string;
  content: RvResourceViewFolderContent;
}

export interface RvResourceViewFolderContent {
  name: string;

  // if present, it means a symbolic node already exist
  resource_model_id?: string;

  // if there are children, this is a folder, otherwise this is a file
  children?: RvResourceViewFolderContent[];
}

export interface RvResourceViewFolderContentFlat {
  name: string;
  resource_model_id?: string;
  level: number;
  isFolder: boolean;
  isLoading: boolean;
}
