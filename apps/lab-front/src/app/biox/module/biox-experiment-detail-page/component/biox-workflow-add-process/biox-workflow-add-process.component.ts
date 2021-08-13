import {Component, OnInit} from '@angular/core';
import {BioxProcessable} from '../../../../../core/model/entities/proccesable/biox-processable.entity';
import {Observable} from 'rxjs';
import {BioxProcessTypeService} from '../../../../../core/entity-service/biox-process-type.service';
import {BioxExperimentFlowFactory} from '../../../../../core/utils/biox-experiment-flow.factory';
import {WorkflowManagerState} from '../../state/workflow-manager-state';
import {BioxProcessTypeTree} from '../../../../../core/model/entities/processable-type/biox-process-type.entity';
import {BioxProtocolTypeTree} from '../../../../../core/model/entities/processable-type/biox-protocol-type.entity';
import {BioxProcessableType} from '../../../../../core/model/entities/processable-type/biox-processable-type.entity';
import {BioxProtocolTypeService} from '../../../../../core/entity-service/biox-protocol-type.service';


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

  protocols$: Observable<BioxProtocolTypeTree[]>;
  processes$: Observable<BioxProcessTypeTree[]>;

  selectedProcess: BioxProcessableType;


  constructor(private workflowManagerService: WorkflowManagerState,
              private bioxProtocolTypeService: BioxProtocolTypeService,
              private bioxProcessTypeService: BioxProcessTypeService) {
  }

  ngOnInit(): void {
    // get process
    this.processes$ = this.bioxProcessTypeService.getProcessTypesTree();

    // get protocols
    this.protocols$ = this.bioxProtocolTypeService.getProtocolTypesTree();
  }

  addProcessable(object: BioxProcessableType): void {
    const processable: BioxProcessable = BioxExperimentFlowFactory.processableFromProcessableSpec(object);

    this.workflowManagerService.addProcessableNode(processable, 0, 0);
  }

  selectProcessable(process: BioxProcessableType): void {
    this.selectedProcess = process;
  }

  selectAndAddProcessable(process: BioxProcessableType): void {
    this.selectProcessable(process);
    this.addProcessable(process);
  }

}
