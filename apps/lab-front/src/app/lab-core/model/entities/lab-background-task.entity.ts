import {LabEntity} from '../global/lab-entity.entity';
import {LabProgressMessage} from './lab-progress-bar.entity';
import {Type} from 'class-transformer';


export class LabBackgroundTask extends LabEntity {

  title: string;

  @Type(() => LabProgressMessage)
  messages: LabProgressMessage[];

  progress?: number;
}
