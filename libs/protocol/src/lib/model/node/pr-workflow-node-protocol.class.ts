import {PrWorkflowNodeProcess} from './pr-workflow-node-process.class';
import {Observable} from 'rxjs';
import {PrProtocolFlow} from '../pr-connection.class';
import {PrProcess} from '../pr-process.entity';

export class PrWorkflowNodeProtocol extends PrWorkflowNodeProcess {

  constructor(process: PrProcess,
              public flow$: Observable<PrProtocolFlow>,
              x: number = 0, y: number = 0,
              additionalObject: any = null) {
    super(process, x, y, additionalObject);
  }
}
