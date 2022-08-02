import {Expose, Type} from 'class-transformer';
import {PrProcess, PrProcessData} from './pr-process.entity';
import {PrProtocolGraphInputNode} from './pr-protocol-graph-input.class';


export class PrTaskData implements PrProcessData {
  title: string;

  description?: string;

  doc?: string;
}


export class PrTask extends PrProcess {

  @Type(() => PrTaskData)
  data: PrTaskData;

  @Expose({name: 'is_protocol'})
  isProtocol: false;

  constructor(inputNode?: PrProtocolGraphInputNode) {
    super(inputNode);
    this.isProtocol = false;
    this.data = super.data;
  }
}
