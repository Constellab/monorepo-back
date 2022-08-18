import {PrProcess, PrProcessData} from './pr-process.entity';
import {PrProtocolGraphInputNode} from './pr-protocol-graph-input.class';


export interface PrTaskData extends PrProcessData {
  title: string;

  description?: string;

  doc?: string;
}


export class PrTask extends PrProcess {

  data: PrTaskData;

  isProtocol: false;

  constructor(inputNode?: PrProtocolGraphInputNode) {
    super(inputNode);
    this.isProtocol = false;
    this.data = super.data;
  }
}
