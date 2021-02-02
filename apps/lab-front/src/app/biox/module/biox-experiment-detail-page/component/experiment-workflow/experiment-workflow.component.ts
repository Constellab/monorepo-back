import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {WorkflowManagerService} from '../../service/workflow-manager.service';
import {BioxExperiment} from '../../../../../core/model/entities/biox-experiment.entity';
import {BioxProcessService} from '../../../../../core/entity-service/biox-process.service';
import {BioxProtocolService} from '../../../../../core/entity-service/biox-protocol.service';
import {BioxProcessable, BioxProcessDatasource, BioxProtocolDatasource} from '../../../../../core/model/entities/biox-processable.entity';
import {BioxFlow, BioxFlowStep} from '../../../../../core/model/entities/biox-flow.entity';
import {WorkflowConnectionSelected} from '../../model/workflow-event.class';
import {FlPortalConfig, FlPortalService} from '@monorepo/front-core-lib';
import {BioxConnection} from '../../../../../core/model/global/biox-connection.class';
import {BioxResourcePortalComponent} from '../../../../../core/entity-module/biox-resource-core/component/biox-resource-portal/biox-resource-portal.component';
import {BioxFlowService} from '../../../../../core/entity-service/biox-flow.service';
import {ConnectedPosition} from '@angular/cdk/overlay';


@Component({
  selector: 'gen-experiment-workflow',
  templateUrl: './experiment-workflow.component.html',
  styleUrls: ['./experiment-workflow.component.scss']
})
export class ExperimentWorkflowComponent implements OnInit {

  @Input() experiment: BioxExperiment;

  @ViewChild('workflow', {static: true}) container: ElementRef<HTMLElement>;

  flow: BioxFlow;

  availableProtocols: BioxProtocolDatasource;
  availableProcesses: BioxProcessDatasource;

  // store the current dragged process
  draggingProcessable: BioxProcessable;

  flowIsLoading: boolean = false;

  constructor(private workflowManagerService: WorkflowManagerService,
              private bioxProtocolService: BioxProtocolService,
              private bioxProcessService: BioxProcessService,
              private bioxFlowService: BioxFlowService,
              private portalService: FlPortalService) {
  }

  // todo handle on destroy
  ngOnInit(): void {
    this.loadExperimentFlow();

    // get protocols
    this.availableProtocols = this.bioxProtocolService.getProtocolsDatasource();

    // get process
    this.availableProcesses = this.bioxProcessService.getProcessesDatasource();
  }


  private loadExperimentFlow(): void {
    this.flowIsLoading = true;
    this.bioxFlowService.getExperimentFlow(this.experiment.id).subscribe(
      flow => this.loadExperimentFlowSuccess(flow),
      () => this.flowIsLoading = false
    );
  }

  private loadExperimentFlowSuccess(flow: BioxFlow): void {
    this.workflowManagerService.init(this.container.nativeElement, flow, this.experiment);
    this.flow = flow;
    this.flowIsLoading = false;

    this.workflowManagerService.onConnectionSelected().subscribe(
      connection => this.onConnectionSelected(connection)
    );
  }

  allowDrop(ev: DragEvent): void {
    ev.preventDefault();
  }


  addProcessable(ev: DragEvent): void {
    this.workflowManagerService.addProcessableNode(this.draggingProcessable,
      this.flow.id, ev.offsetX, ev.offsetY);
    this.draggingProcessable = null;
  }


  dragStart(processable: BioxProcessable): void {
    this.draggingProcessable = processable;
  }

  onConnectionSelected(connectionEvent: WorkflowConnectionSelected): void {
    const connection: BioxConnection = connectionEvent.connection.object;

    if (connection instanceof BioxFlowStep) {
      const position: ConnectedPosition[] = [{
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom',
        offsetY: -20
      }];
      const portalConfig: FlPortalConfig = this.portalService.configureRelativePortal(connectionEvent.event.target as any, position, {
        panelClass: 'g-portal-panel',
        elevation: true,
        disposeOnNavigation: true,
        size: 'small',
        disposeOnOutsideClick: true,
      });

      this.portalService.createPortal(BioxResourcePortalComponent, portalConfig, connection.resource.getObs());
    }

  }


}
