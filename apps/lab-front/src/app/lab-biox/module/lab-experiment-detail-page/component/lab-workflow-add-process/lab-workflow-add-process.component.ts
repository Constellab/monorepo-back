import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {LabWorkflowManagerState} from '../../state/lab-workflow-manager-state';
import {LabProcessType} from '../../../../../lab-core/model/entities/lab-type/lab-process-type.entity';
import {LabTypeEntity, LabTypeEntityTree} from '../../../../../lab-core/model/entities/lab-type/lab-type.entity';
import {LabTaskService} from '../../../../../lab-core/entity-service/lab-task.service';
import {LabProtocolService} from '../../../../../lab-core/entity-service/lab-protocol.service';


/**
 * Component that show the list of process type and protocol type
 * with possibility to drag them to the workflow
 */
@Component({
  selector: 'lab-workflow-add-process',
  templateUrl: './lab-workflow-add-process.component.html',
  styleUrls: ['./lab-workflow-add-process.component.scss']
})
export class LabWorkflowAddProcessComponent implements OnInit {

  protocols$: Observable<LabTypeEntityTree[]>;
  tasks$: Observable<LabTypeEntityTree[]>;

  processType$: Observable<LabProcessType>;

  constructor(private workflowManagerService: LabWorkflowManagerState,
              private protocolService: LabProtocolService,
              private taskService: LabTaskService) {
  }

  ngOnInit(): void {
    // get tasks
    this.tasks$ = this.taskService.getTaskTypesTree();

    // get protocols
    this.protocols$ = this.protocolService.getProtocolTypesTree();
  }

  addProcess(processType: LabTypeEntity): void {
    this.workflowManagerService.addProcessNode(processType.typingName, processType.name);
  }

  selectTask(task: LabTypeEntity): void {
    this.processType$ = this.taskService.getTaskType(task.id);
  }

  selectProtocol(protocol: LabTypeEntity): void {
    this.processType$ = this.protocolService.getProtocolType(protocol.id);
  }

  selectAndAddTask(task: LabTypeEntity): void {
    this.selectTask(task);
    this.addProcess(task);
  }

  selectAndAddProtocol(protocol: LabTypeEntity): void {
    this.selectProtocol(protocol);
    this.addProcess(protocol);
  }


}
