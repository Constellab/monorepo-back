import {Expose, Type} from 'class-transformer';
import {LabProcess, LabProcessData} from './lab-process.entity';

export class LabTaskData implements LabProcessData {
  title: string;

  description?: string;

  doc?: string;

  graph: void;
}


export class LabTask extends LabProcess {

  @Type(() => LabTaskData)
  data: LabTaskData;

  @Expose({name: 'is_protocol'})
  isProtocol: false;
}
