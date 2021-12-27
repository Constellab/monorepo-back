import {Type} from 'class-transformer';
import {LabTaskType} from '../lab-type/lab-task-type.entity';

/**
 * DTO object to list the importer of a resource type
 */
export class LabResourceImporterType {

  @Type(() => LabTaskType)
  resource: LabTaskType;

  @Type(() => LabTaskType)
  importers: LabTaskType[];
}
