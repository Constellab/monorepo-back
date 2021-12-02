import {Component, OnDestroy, OnInit} from '@angular/core';
import {BioxWorkflowNodeDetailState} from '../../state/biox-workflow-node-detail.state';
import {Observable, Subscription} from 'rxjs';
import {FlDialogService, FlStatusEvent} from '@monorepo/front-core-lib';
import {BioxResource} from '../../../../../core/model/entities/resource/biox-resource.entity';
import {BioxSelectResourceDialogComponent} from '../../../../../core/entity-module/biox-resource-core/component/biox-select-resource-dialog/biox-select-resource-dialog.component';
import {WorkflowNodeSource} from '../../model/workflow-node-source.class';
import {RouterService} from '../../../../../core/service/router.service';

/**
 * Specific component to configure a task of type gws.plug.Source
 *
 * This allows the user to select a resource
 */
@Component({
  selector: 'gen-biox-task-source-config',
  templateUrl: './biox-task-source-config.component.html',
  styleUrls: ['./biox-task-source-config.component.scss']
})
export class BioxTaskSourceConfigComponent implements OnInit, OnDestroy {

  selectedResource$: Observable<FlStatusEvent<BioxResource>>;

  resourceRoute: string;

  private node: WorkflowNodeSource;
  private subscription: Subscription;


  constructor(private nodeDetail: BioxWorkflowNodeDetailState,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.subscription = this.nodeDetail.getNode$().subscribe(
      node => this.setNode(node as WorkflowNodeSource)
    );
  }

  private setNode(node: WorkflowNodeSource): void {
    // security to prevent not source node
    // it can be called because the state change before the component is destroy
    if (!(node instanceof WorkflowNodeSource)) return;
    this.node = node;
    this.selectedResource$ = node.getLoadedResource$();
  }

  getResourceRoute(resource: BioxResource): string {
    return RouterService.getBioxResourceDetailRoute(resource.id);
  }


  openResourceSelection(): void {
    this.dialogService.openBigDialog(BioxSelectResourceDialogComponent).afterClosed().subscribe(
      resource => this.onResourceSelectionClosed(resource)
    );
  }

  private onResourceSelectionClosed(resource?: BioxResource): void {
    if (resource) {
      this.nodeDetail.updateConfigValues({resource_id: resource.id});
      this.node.setLoadedResource(resource);
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }


}
