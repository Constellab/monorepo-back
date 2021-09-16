import {Expose, Type} from 'class-transformer';
import {BioxProcess, BioxProcessData} from './biox-process.entity';

export class BioxTaskData implements BioxProcessData {
  title: string;

  description?: string;

  doc?: string;

  graph: void;
}


export class BioxTask extends BioxProcess {

  @Type(() => BioxTaskData)
  data: BioxTaskData;

  @Expose({name: 'is_protocol'})
  isProtocol: false;
}
