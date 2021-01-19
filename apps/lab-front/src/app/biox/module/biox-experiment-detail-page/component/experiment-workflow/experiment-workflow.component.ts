import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {WorkflowManagerService} from '../../service/workflow-manager.service';
import {BioxExperiment} from '../../../../../core/model/entities/biox-experiment.entity';
import {BioxProcessService} from '../../../../../core/entity-service/biox-process.service';
import {BioxProtocolService} from '../../../../../core/entity-service/biox-protocol.service';
import {BioxProcessable, BioxProcessDatasource, BioxProtocolDatasource} from '../../../../../core/model/global/biox-processable.class';
import {BioxExperimentService} from '../../../../../core/entity-service/biox-experiment.service';
import {BioxExperimentFlow} from '../../../../../core/model/entities/biox-experiment-flow.entity';

@Component({
  selector: 'gen-experiment-workflow',
  templateUrl: './experiment-workflow.component.html',
  styleUrls: ['./experiment-workflow.component.scss']
})
export class ExperimentWorkflowComponent implements OnInit {

  @Input() experiment: BioxExperiment;

  @ViewChild('workflow', {static: true}) container: ElementRef<HTMLElement>;

  flow: BioxExperimentFlow;

  availableProtocols: BioxProtocolDatasource;
  availableProcesses: BioxProcessDatasource;

  // store the current dragged process
  draggingProcessable: BioxProcessable;

  flowIsLoading: boolean = false;

  constructor(private workflowManagerService: WorkflowManagerService,
              private bioxProtocolService: BioxProtocolService,
              private bioxProcessService: BioxProcessService,
              private bioxExperimentService: BioxExperimentService) {
  }

  ngOnInit(): void {
    this.loadExperimentFlow();

    // get protocols
    // this.availableProtocols = this.bioxProtocolService.getProtocolsDatasource();

    // get process
    this.availableProcesses = this.bioxProcessService.getProcessesDatasource();
  }

  private loadExperimentFlow(): void {
    this.flowIsLoading = true;
    this.bioxExperimentService.getExperimentFlow(this.experiment.id).subscribe(
      flow => this.loadExperimentFlowSuccess(flow),
      () => this.flowIsLoading = false
    );
  }

  private loadExperimentFlowSuccess(flow: BioxExperimentFlow): void {
    this.workflowManagerService.init(this.container.nativeElement, flow);
    this.flow = flow;
    this.flowIsLoading = false;
  }


  addNode(): void {
    // const node: WorkflowNode = new WorkflowNode('name', 1, 2);
    // this.workflowManagerService.addNode(node);
  }

  allowDrop(ev: DragEvent): void {
    ev.preventDefault();
  }


  // todo check that the object is a processable
  addProcessable(ev: DragEvent): void {
    this.workflowManagerService.addProcessableNode(this.draggingProcessable,
      this.experiment.id, this.flow.id,
      ev.offsetX, ev.offsetY);
    this.draggingProcessable = null;
  }


  dragStart(processable: BioxProcessable): void {
    this.draggingProcessable = processable;
  }

  switch(): void {
    this.workflowManagerService.switchModule();
  }


}
