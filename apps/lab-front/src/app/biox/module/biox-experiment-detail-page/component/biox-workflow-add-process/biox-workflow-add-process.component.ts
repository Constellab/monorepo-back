import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {BioxProcessTypeService} from '../../../../../core/entity-service/biox-process-type.service';
import {WorkflowManagerState} from '../../state/workflow-manager-state';
import {BioxProcessableType} from '../../../../../core/model/entities/lab-type/biox-processable-type.entity';
import {BioxProtocolTypeService} from '../../../../../core/entity-service/biox-protocol-type.service';
import {BioxLabTypeEntity, BioxLabTypeEntityTree} from '../../../../../core/model/entities/lab-type/biox-lab-type.entity';


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
  processes$: Observable<BioxLabTypeEntityTree[]>;

  processableType$: Observable<BioxProcessableType>;

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

  addProcessable(processableType: BioxProcessableType): void {
    this.addProcessableFromTypingName(processableType.typingName)
  }

  private addProcessableFromTypingName(processableTypingName: string): void{
    this.workflowManagerService.addProcessableNode(processableTypingName);
  }

  selectProcess(process: BioxLabTypeEntity): void {
    this.processableType$ = this.bioxProcessTypeService.getProcessType(process.id);
  }

  selectProtocol(protocol: BioxLabTypeEntity): void {
    this.processableType$ = this.bioxProtocolTypeService.getProtocolType(protocol.id);
  }

  selectAndAddProcess(process: BioxLabTypeEntity): void {
    this.selectProcess(process);
    this.addProcessableFromTypingName(process.typingName);
  }

  selectAndAddProtocol(protocol: BioxLabTypeEntity): void {
    this.selectProtocol(protocol);
    this.addProcessableFromTypingName(protocol.typingName);
  }


}
