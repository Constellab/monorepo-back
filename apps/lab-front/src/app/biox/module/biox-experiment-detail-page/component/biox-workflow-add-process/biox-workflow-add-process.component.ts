import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {WorkflowManagerState} from '../../state/workflow-manager-state';
import {BioxProcessType} from '../../../../../core/model/entities/lab-type/biox-process-type.entity';
import {BioxLabTypeEntity, BioxLabTypeEntityTree} from '../../../../../core/model/entities/lab-type/biox-lab-type.entity';
import {BioxTaskService} from '../../../../../core/entity-service/biox-task.service';
import {BioxProtocolService} from '../../../../../core/entity-service/biox-protocol.service';


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

  protocols$: Observable<BioxLabTypeEntityTree[]>;
  tasks$: Observable<BioxLabTypeEntityTree[]>;

  processType$: Observable<BioxProcessType>;

  constructor(private workflowManagerService: WorkflowManagerState,
              private bioxProtocolTypeService: BioxProtocolService,
              private bioxTaskService: BioxTaskService) {
  }

  ngOnInit(): void {
    // get tasks
    this.tasks$ = this.bioxTaskService.getTaskTypesTree();

    // get protocols
    this.protocols$ = this.bioxProtocolTypeService.getProtocolTypesTree();
  }

  addProcess(processType: BioxLabTypeEntity): void {
    this.workflowManagerService.addProcessNode(processType.typingName, processType.name);
  }

  selectTask(task: BioxLabTypeEntity): void {
    this.processType$ = this.bioxTaskService.getTaskType(task.id);
  }

  selectProtocol(protocol: BioxLabTypeEntity): void {
    this.processType$ = this.bioxProtocolTypeService.getProtocolType(protocol.id);
  }

  selectAndAddTask(task: BioxLabTypeEntity): void {
    this.selectTask(task);
    this.addProcess(task);
  }

  selectAndAddProtocol(protocol: BioxLabTypeEntity): void {
    this.selectProtocol(protocol);
    this.addProcess(protocol);
  }


}
