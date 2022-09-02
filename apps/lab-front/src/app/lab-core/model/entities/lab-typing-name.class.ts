import {RvTransformerParams} from '@monorepo/resource-view';
import {LabConfigValues} from './lab-config.entity';

/**
 * List of specific typing name
 */

export class LabTypingName {

  public static model = {
    //Typing name of the resource class
    resource: 'labTypingNameResource'
  };

  public static task = {
    source: 'TASK.gws_core.Source',
    output: {
      typingName: 'TASK.gws_core.Sink',
      resourceInput: 'resource'
    },
    tableImporter: 'TASK.gws_core.TableImporter',
    viewer: 'TASK.gws_core.Viewer',
  };

  public static resource = {
    file: 'RESOURCE.gws_core.File',
    folder: 'RESOURCE.gws_core.Folder',
    tableFile: 'RESOURCE.gws_core.TableFile',
  };

  public static importer = {
    tableImporter: 'TASK.gws_core.TableImporter',
    jsonImporter: 'TASK.gws_core.JSONImporter',
    textImporter: 'TASK.gws_core.TextImporter',
  };
}

export interface LabTaskSourceConfig {
  resource_id: string;
}

// configuration object for the Viewer
export interface LabTaskViewerConfig {
  resource_typing_name: string;
  view_config: {
    view_method_name: string;
    config_values: LabConfigValues;
    transformers: RvTransformerParams[];
  };
}
