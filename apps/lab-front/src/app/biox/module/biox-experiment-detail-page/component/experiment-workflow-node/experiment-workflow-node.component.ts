import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {WorkflowManagerService} from '../../service/workflow-manager.service';
import {WorkflowNode} from '../../model/workflow-node.class';
import {BioxJob} from '../../../../../core/model/entities/biox-job.entity';
import {FlDialogService, FlPortalConfig, FlPortalService} from '@monorepo/front-core-lib';
import {
  BioxConfigureSpecsDialogComponent,
  BioxConfigureSpecsDialogInput
} from '../../../../../core/entity-module/biox-config-core/component/biox-configure-specs-dialog/biox-configure-specs-dialog.component';
import {ConnectedPosition} from '@angular/cdk/overlay';
import {BioxShowConfigPortalComponent} from '../../../../../core/entity-module/biox-config-core/component/biox-show-config-portal/biox-show-config-portal.component';

/**
 * Node of an experiment in the workflow
 *
 * This component is converted to an angular element to be injectable in css
 */
@Component({
  selector: 'gen-experiment-workflow-node',
  templateUrl: './experiment-workflow-node.component.html',
  styleUrls: ['./experiment-workflow-node.component.scss']
})
export class ExperimentWorkflowNodeComponent implements OnInit {

  // Name of the node
  @Input() name: string;

  @ViewChild('container', {static: true}) container: ElementRef<HTMLElement>;

  node: WorkflowNode<BioxJob>;

  constructor(private workflowManager: WorkflowManagerService,
              private dialogService: FlDialogService,
              private portalService: FlPortalService) {
  }

  ngOnInit(): void {
    this.node = this.workflowManager.findNodeWithName(this.name);
    if (this.node == null) {
      console.error('Couldn\'t find node with name : ' + this.name);
    }
  }

  nodeIsProtocol(): boolean {
    return this.node.object.process.isProtocol();
  }

  zoomInProtocol(): void {
    return this.workflowManager.selectLayer(this.node.nodeId);
  }

  get showConfigButton(): boolean {
    return this.node.object.process.hasConfigSpecs();
  }

  openConfig(): void {
    if (this.workflowManager.getMode() === 'edit') {
      const input: BioxConfigureSpecsDialogInput = {
        configSpecs: this.node.object.process.configSpecs,
        currentConfig: this.node.object.config.params,
      };

      this.dialogService.openSmallDialog(BioxConfigureSpecsDialogComponent,
        {data: input}).afterClosed().subscribe(
        config => this.onConfigDialogClosed(config)
      );

    } else {
      const position: ConnectedPosition[] = [{
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom',
        offsetY: -20
      }];
      const portalConfig: FlPortalConfig = this.portalService.configureRelativePortal(
        this.container.nativeElement, position, {
          panelClass: 'g-portal-panel',
          elevation: true,
          disposeOnNavigation: true,
          size: 'small',
          disposeOnOutsideClick: true,
        }
      );
      this.portalService.createPortal(BioxShowConfigPortalComponent, portalConfig, this.node.object.getCurrentConfig());
    }

  }

  private onConfigDialogClosed(config?: any): void {
    if (config != null) {
      this.node.object.config.params = config;
    }
  }

}
