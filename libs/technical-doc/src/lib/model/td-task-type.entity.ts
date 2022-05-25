import {TdProcessType} from './td-process-type.entity';

/**
 * Define the a task
 */
export interface TdTaskType extends TdProcessType {
  additionalInfo: TdAdditionalInfoDTO | undefined;
}

export interface TdAdditionalInfoDTO {
  supported_extensions: string[];
}
