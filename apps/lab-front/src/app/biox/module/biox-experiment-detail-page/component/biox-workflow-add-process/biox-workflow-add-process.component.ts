import {Component, OnInit} from '@angular/core';
import {BioxProcessable, BioxProtocolDatasource, BioxProtocolVM} from '../../../../../core/model/entities/biox-processable.entity';
import {Observable} from 'rxjs';
import {BioxProcessType, BioxProcessTypeDatasource} from '../../../../../core/model/entities/biox-process-type.entity';
import {BioxProtocolService} from '../../../../../core/entity-service/biox-protocol.service';
import {BioxProcessTypeService} from '../../../../../core/entity-service/biox-process-type.service';
import {BioxExperimentFlowFactory} from '../../../../../core/utils/biox-experiment-flow.factory';
import {WorkflowManagerState} from '../../state/workflow-manager-state';

/**
 * Component that show the list of process type and protocol type
 * with possibility to drag them to the workflow
 */
@Component({
  selector: 'gen-biox-workflow-add-process',
  templateUrl: './biox-workflow-add-process.component.html',
  styleUrls: ['./biox-workflow-add-process.component.scss']
})
export class BioxWorkflowAddProcessComponent implements OnInit {

  availableProtocols: BioxProtocolDatasource;
  protocols$: Observable<BioxProtocolVM[]>;
  availableProcesses: BioxProcessTypeDatasource;
  processes$: Observable<BioxProcessType[]>;

  constructor(private workflowManagerService: WorkflowManagerState,
              private bioxProtocolService: BioxProtocolService,
              private bioxProcessTypeService: BioxProcessTypeService) {
  }

  ngOnInit(): void {

    // get protocols
    // this.availableProtocols = this.bioxProtocolService.getProtocolsDatasource();
    // this.protocols$ = this.availableProtocols.connect();

    // get process
    this.availableProcesses = this.bioxProcessTypeService.getProcessesDatasource();
    this.processes$ = this.availableProcesses.connect();
  }

  addProcessable(object: BioxProcessType): void {
    let processable: BioxProcessable;

    if (object instanceof BioxProcessType) {
      processable = BioxExperimentFlowFactory.processTypeToBioxProcess(object);
    } else {
      processable = object;
    }

    this.workflowManagerService.addProcessableNode(processable, 0, 0);
  }

}
