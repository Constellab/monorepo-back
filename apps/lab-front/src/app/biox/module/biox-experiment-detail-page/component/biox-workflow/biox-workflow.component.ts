import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {WorkflowManagerState} from '../../state/workflow-manager-state';
import {BioxProtocolService} from '../../../../../core/entity-service/biox-protocol.service';
import {BioxProtocol} from '../../../../../core/model/entities/biox-processable.entity';
import {FlPortalConfig, FlPortalService} from '@monorepo/front-core-lib';
import {BioxConnection, BioxFlow} from '../../../../../core/model/global/biox-connection.class';
import {BioxResourcePortalComponent} from '../../../../../core/entity-module/biox-resource-core/component/biox-resource-portal/biox-resource-portal.component';
import {ConnectedPosition} from '@angular/cdk/overlay';
import {WorkflowConnection} from '../../model/workflow-connection.class';
import {BioxProcessTypeService} from '../../../../../core/entity-service/biox-process-type.service';
import {BioxProtocolLink} from '../../../../../core/model/entities/biox-protocol-link.entity';
import {BioxExperimentDetailPageState} from '../../state/biox-experiment-detail-page.state';


@Component({
  selector: 'gen-biox-workflow',
  templateUrl: './biox-workflow.component.html',
  styleUrls: ['./biox-workflow.component.scss']
})
export class BioxWorkflowComponent implements OnInit, OnDestroy {

  @ViewChild('workflow', {static: false}) container: ElementRef<HTMLElement>;

  protocol: BioxFlow<BioxProtocol>;


  flowIsLoading: boolean = false;
  error: boolean = false;

  constructor(private workflowManagerService: WorkflowManagerState,
              private bioxProtocolService: BioxProtocolService,
              private bioxProcessTypeService: BioxProcessTypeService,
              private portalService: FlPortalService,
              private experimentState: BioxExperimentDetailPageState) {
  }

  ngOnInit(): void {
    this.loadExperimentFlow();

  }


  private loadExperimentFlow(): void {
    this.flowIsLoading = true;
    this.bioxProtocolService.getProtocolAsFlow(this.experimentState.currentExperiment.protocol.id).subscribe(
      flow => this.loadExperimentFlowSuccess(flow),
      () => this.onError()
    );
  }

  private loadExperimentFlowSuccess(flow: BioxFlow<BioxProtocol>): void {
    this.workflowManagerService.init(this.container.nativeElement, flow, this.experimentState.currentExperiment);
    this.protocol = flow;
    this.flowIsLoading = false;

    this.workflowManagerService.onConnectionSelected().subscribe(
      connection => this.onConnectionSelected(connection)
    );
  }


  get experimentIsUpdatable(): boolean {
    return this.experimentState.currentExperiment.getStatusName() !== 'archived';
  }


  // TOdo to move to action state
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
