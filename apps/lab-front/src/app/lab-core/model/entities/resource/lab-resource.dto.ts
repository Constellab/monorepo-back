import {Type} from 'class-transformer';
import {LabProcessType} from '../lab-type/lab-process-type.entity';

/**
 * DTO object to list the importer of a resource type
 */
export class LabResourceImporterType {

  @Type(() => LabProcessType)
  resource: LabProcessType;

  @Type(() => LabProcessType)
  importers: LabProcessType[];
}
