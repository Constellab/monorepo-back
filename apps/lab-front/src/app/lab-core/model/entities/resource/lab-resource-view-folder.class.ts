import {LabResourceViewBase} from './lab-resource-view.entity';

export interface LabResourceViewFolder extends LabResourceViewBase {
  type: 'folder-view',
  data: LabResourceViewFolderData
}

export interface LabResourceViewFolderData {
  path: string;
  content: LabResourceViewFolderContent;
}

export interface LabResourceViewFolderContent {
  name: string;

  // if present, it means a symbolic node already exist
  resource_model_id?: string;

  // if there are children, this is a folder, otherwise this is a file
  children?: LabResourceViewFolderContent[];
}

export interface LabResourceViewFolderContentFlat {
  name: string;
  resource_model_id?: string;
  level: number;
  isFolder: boolean;
  isLoading: boolean;
}
