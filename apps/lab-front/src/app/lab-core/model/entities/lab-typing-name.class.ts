
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
    output: 'TASK.gws_core.Sink',
    tableImporter:  'TASK.gws_core.TableImporter'
  };

  public static resource = {
    file: 'RESOURCE.gws_core.File',
    folder: 'RESOURCE.gws_core.Folder',
    tableFile: 'RESOURCE.gws_core.TableFile',
  }

  public static importer = {
    tableImporter: 'TASK.gws_core.TableImporter',
    jsonImporter: 'TASK.gws_core.JSONImporter',
    textImporter: 'TASK.gws_core.TextImporter',
  }
}
