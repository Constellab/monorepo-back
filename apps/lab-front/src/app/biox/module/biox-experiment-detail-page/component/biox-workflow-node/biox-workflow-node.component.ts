import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {WorkflowManagerState} from '../../state/workflow-manager-state';
import {FlDialogService, FlPortalConfig, FlPortalService} from '@monorepo/front-core-lib';
import {BioxConfigureSpecsDialogComponent} from '../../../../../core/entity-module/biox-config-core/component/biox-configure-specs-dialog/biox-configure-specs-dialog.component';
import {ConnectedPosition} from '@angular/cdk/overlay';
import {BioxShowConfigPortalComponent} from '../../../../../core/entity-module/biox-config-core/component/biox-show-config-portal/biox-show-config-portal.component';
import {Observable} from 'rxjs';
import {ClHelpService} from '@monorepo/core-lib';
import {WorkflowActionState} from '../../state/workflow-action-state.service';
import {WorkflowNodeProcessable} from '../../model/workflow-node-processable.class';

/**
 * Node of an experiment in the workflow
 *
 * This component is converted to an angular element to be injectable in css
 */
@Component({
  selector: 'gen-biox-workflow-node',
  templateUrl: './biox-workflow-node.component.html',
  styleUrls: ['./biox-workflow-node.component.scss']
})
export class BioxWorkflowNodeComponent implements OnInit {

  // Name of the node
  @Input() name: string;

  @ViewChild('container', {static: true}) container: ElementRef<HTMLElement>;

  node: WorkflowNodeProcessable;

  layerIsLoading$: Observable<boolean>;

  constructor(private workflowManager: WorkflowManagerState,
              private dialogService: FlDialogService,
              private portalService: FlPortalService,
              private drawerState: WorkflowActionState) {
  }

  ngOnInit(): void {
    this.node = this.workflowManager.findNodeWithName(this.name) as WorkflowNodeProcessable;
    if (this.node == null) {
      console.error('Couldn\'t find node with name : ' + this.name);
    }

    this.layerIsLoading$ = this.workflowManager.layerIsLoading$;
  }

  nodeIsProtocol(): boolean {
    return this.node.object.isProtocol();
  }

  zoomInProtocol(): void {
    return this.workflowManager.selectLayer(this.node.nodeId);
  }

  get showConfigButton(): boolean {
    return this.node.object.hasConfig();
  }

  openConfig(event: MouseEvent): void {
    ClHelpService.stopEventPropagation(event);

    if (this.workflowManager.getMode() === 'edit') {
      this.dialogService.openMediumDialog(BioxConfigureSpecsDialogComponent,
        {data: this.node.object.config.data}).afterClosed().subscribe(
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
      this.portalService.createPortal(BioxShowConfigPortalComponent, portalConfig,
        this.node.object.config.data.mergeConfigWithDefault());
    }
  }

  private onConfigDialogClosed(config?: any): void {
    if (config != null) {
      // save the config into the value
      this.node.object.config.data.params = config;
    }
  }

  openNodeDetail(): void {
    this.drawerState.newAction({
      action: 'selectNode',
      processableNode: this.node
    });
  }

}
