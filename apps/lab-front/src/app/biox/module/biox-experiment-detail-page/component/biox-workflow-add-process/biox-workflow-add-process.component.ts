import {Component, OnInit} from '@angular/core';
import {BioxProcessable} from '../../../../../core/model/entities/biox-processable.entity';
import {Observable} from 'rxjs';
import {BioxProtocolService} from '../../../../../core/entity-service/biox-protocol.service';
import {BioxProcessTypeService} from '../../../../../core/entity-service/biox-process-type.service';
import {BioxExperimentFlowFactory} from '../../../../../core/utils/biox-experiment-flow.factory';
import {WorkflowManagerState} from '../../state/workflow-manager-state';
import {BioxProcessType, BioxProcessTypedTree} from '../../../../../core/model/entities/biox-process-type.entity';


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

  // availableProtocols: BioxProtocolDatasource;
  // protocols$: Observable<BioxProtocolVM[]>;
  processes$: Observable<BioxProcessTypedTree[]>;

  selectedProcess: BioxProcessType;


  constructor(private workflowManagerService: WorkflowManagerState,
              private bioxProtocolService: BioxProtocolService,
              private bioxProcessTypeService: BioxProcessTypeService) {
  }

  ngOnInit(): void {

    // get protocols
    // this.availableProtocols = this.bioxProtocolService.getProtocolsDatasource();
    // this.protocols$ = this.availableProtocols.connect();

    // get process
    this.processes$ = this.bioxProcessTypeService.getProcessTypesGrouped();
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

  selectProcess(process: BioxProcessType): void {
    this.selectedProcess = process;
  }

  selectAndAddProcess(process: BioxProcessType): void {
    this.selectProcess(process);
    this.addProcessable(process);
  }

}
