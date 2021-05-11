import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {WorkflowManagerState} from '../../state/workflow-manager-state';
import {BioxExperiment} from '../../../../../core/model/entities/biox-experiment.entity';
import {BioxProtocolService} from '../../../../../core/entity-service/biox-protocol.service';
import {
  BioxProcessable,
  BioxProtocol,
  BioxProtocolDatasource,
  BioxProtocolVM
} from '../../../../../core/model/entities/biox-processable.entity';
import {FlPortalConfig, FlPortalService} from '@monorepo/front-core-lib';
import {BioxConnection, BioxFlow} from '../../../../../core/model/global/biox-connection.class';
import {BioxResourcePortalComponent} from '../../../../../core/entity-module/biox-resource-core/component/biox-resource-portal/biox-resource-portal.component';
import {ConnectedPosition} from '@angular/cdk/overlay';
import {WorkflowConnection} from '../../model/workflow-connection.class';
import {Observable} from 'rxjs';
import {BioxProcessType, BioxProcessTypeDatasource} from '../../../../../core/model/entities/biox-process-type.entity';
import {BioxProcessTypeService} from '../../../../../core/entity-service/biox-process-type.service';
import {BioxProtocolLink} from '../../../../../core/model/entities/biox-protocol-link.entity';
import {BioxExperimentFlowFactory} from '../../../../../core/utils/biox-experiment-flow.factory';


@Component({
  selector: 'gen-biox-workflow',
  templateUrl: './biox-workflow.component.html',
  styleUrls: ['./biox-workflow.component.scss']
})
export class BioxWorkflowComponent implements OnInit, OnDestroy {

  @Input() experiment: BioxExperiment;

  @ViewChild('workflow', {static: false}) container: ElementRef<HTMLElement>;

  protocol: BioxFlow<BioxProtocol>;

  availableProtocols: BioxProtocolDatasource;
  protocols$: Observable<BioxProtocolVM[]>;
  availableProcesses: BioxProcessTypeDatasource;
  processes$: Observable<BioxProcessType[]>;

  // store the current dragged process
  draggingProcessable: BioxProcessable | BioxProcessType;

  flowIsLoading: boolean = false;
  error: boolean = false;

  constructor(private workflowManagerService: WorkflowManagerState,
              private bioxProtocolService: BioxProtocolService,
              private bioxProcessTypeService: BioxProcessTypeService,
              private portalService: FlPortalService) {
  }

  ngOnInit(): void {
    this.loadExperimentFlow();

    // get protocols
    // this.availableProtocols = this.bioxProtocolService.getProtocolsDatasource();
    // this.protocols$ = this.availableProtocols.connect();

    // get process
    this.availableProcesses = this.bioxProcessTypeService.getProcessesDatasource();
    this.processes$ = this.availableProcesses.connect();
  }


  private loadExperimentFlow(): void {
    this.flowIsLoading = true;
    this.bioxProtocolService.getProtocolAsFlow(this.experiment.protocol.id).subscribe(
      flow => this.loadExperimentFlowSuccess(flow),
      () => this.onError()
    );
  }

  private loadExperimentFlowSuccess(flow: BioxFlow<BioxProtocol>): void {
    this.workflowManagerService.init(this.container.nativeElement, flow, this.experiment);
    this.protocol = flow;
    this.flowIsLoading = false;

    this.workflowManagerService.onConnectionSelected().subscribe(
      connection => this.onConnectionSelected(connection)
    );
  }

  allowDrop(ev: DragEvent): void {
    ev.preventDefault();
  }

  get experimentIsUpdatable(): boolean {
    return this.experiment.getStatusName() !== 'archived';
  }


  addProcessable(ev: DragEvent): void {
    let processable: BioxProcessable;

    if(this.draggingProcessable instanceof BioxProcessType){
      processable = BioxExperimentFlowFactory.processTypeToBioxProcess(this.draggingProcessable);
    }
    else{
      processable = this.draggingProcessable;
    }

    this.workflowManagerService.addProcessableNode(processable, ev.offsetX, ev.offsetY);
    this.draggingProcessable = null;
  }


  dragStart(processable: BioxProcessable | BioxProcessType): void {
    this.draggingProcessable = processable;
  }

  onConnectionSelected(workflowConnection: WorkflowConnection): void {
    const connection: BioxConnection = workflowConnection.object;

    if (connection instanceof BioxProtocolLink) {
      const connectionHtmlElement: HTMLElement = workflowConnection.getHTMLElement();

      if (connectionHtmlElement == null) {
        return;
      }

      const position: ConnectedPosition[] = [{
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom',
        offsetY: -20
      }];
      const portalConfig: FlPortalConfig = this.portalService.configureRelativePortal(connectionHtmlElement, position, {
        panelClass: 'g-portal-panel',
        elevation: true,
        disposeOnNavigation: true,
        size: 'small',
        disposeOnOutsideClick: true,
        scrollStrategy: this.portalService.getCloseOnScrollStrategy()
      });

      this.portalService.createPortal(BioxResourcePortalComponent, portalConfig, connection.resource.getObs());
    }
  }

  private onError(): void {
    this.flowIsLoading = false;
    this.error = true;
  }

  ngOnDestroy(): void {
    this.workflowManagerService.clear();
  }

}
