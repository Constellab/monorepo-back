import {Expose, Type} from 'class-transformer';
import {BioxProcessable, BioxProcessableData} from './biox-processable.entity';

export class BioxTaskData implements BioxProcessableData {
  title: string;

  description?: string;

  doc?: string;

  graph: void;
}


export class BioxTask extends BioxProcessable {

  @Type(() => BioxTaskData)
  data: BioxTaskData;

  @Expose({name: 'is_protocol'})
  isProtocol: false;
}
