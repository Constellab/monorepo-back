import {Component, OnInit} from '@angular/core';
import {BioxProcessable} from '../../../../../core/model/entities/proccesable/biox-processable.entity';
import {Observable} from 'rxjs';
import {BioxProtocolService} from '../../../../../core/entity-service/biox-protocol.service';
import {BioxProcessSpecService} from '../../../../../core/entity-service/biox-process-spec.service';
import {BioxExperimentFlowFactory} from '../../../../../core/utils/biox-experiment-flow.factory';
import {WorkflowManagerState} from '../../state/workflow-manager-state';
import {BioxProcessSpecTree} from '../../../../../core/model/entities/processable-spec/biox-process-spec.entity';
import {BioxProtocolSpec} from '../../../../../core/model/entities/processable-spec/biox-protocol-spec.entity';
import {BioxProcessableSpec} from '../../../../../core/model/entities/processable-spec/biox-processable-spec.entity';
import {clRxjsDebug} from '@monorepo/core-lib';


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

  protocols$: Observable<BioxProtocolSpec[]>;
  processes$: Observable<BioxProcessSpecTree[]>;

  selectedProcess: BioxProcessableSpec;


  constructor(private workflowManagerService: WorkflowManagerState,
              private bioxProtocolService: BioxProtocolService,
              private bioxProcessTypeService: BioxProcessSpecService) {
  }

  ngOnInit(): void {
    // get process
    this.processes$ = this.bioxProcessTypeService.getProcessTypesTree();

    // get protocols
    // todo replace with a tree of protocol like the processes
    this.protocols$ = this.bioxProtocolService.getProtocolSpecsDatasource().connect().pipe(clRxjsDebug());
  }

  addProcessable(object: BioxProcessableSpec): void {
    const processable: BioxProcessable = BioxExperimentFlowFactory.processableFromProcessableSpec(object);

    this.workflowManagerService.addProcessableNode(processable, 0, 0);
  }

  selectProcessable(process: BioxProcessableSpec): void {
    this.selectedProcess = process;
  }

  selectAndAddProcessable(process: BioxProcessableSpec): void {
    this.selectProcessable(process);
    this.addProcessable(process);
  }

}
