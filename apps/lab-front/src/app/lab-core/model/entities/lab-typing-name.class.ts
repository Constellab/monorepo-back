
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
    sink: 'TASK.gws_core.Sink',
    tableImporter:  'TASK.gws_core.TableImporter'
  };

  public static resource = {
    file: 'RESOURCE.gws_core.File',
    tableFile: 'RESOURCE.gws_core.TableFile',
  }
}
