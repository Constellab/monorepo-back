import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {PrWorkflowLayer} from '../../model/pr-workflow-layer.class';
import {PrWorkflowManagerState} from '../../state/pr-workflow-manager-state';

/**
 * Component to show the current layer hierarchy
 */
@Component({
  selector: 'pr-workflow-layers-breadcrumb',
  templateUrl: './pr-workflow-layers-breadcrumb.component.html',
  styleUrls: ['./pr-workflow-layers-breadcrumb.component.scss']
})
export class PrWorkflowLayersBreadcrumbComponent implements OnInit {

  layers$: Observable<PrWorkflowLayer[]>;

  constructor(private workflowManager: PrWorkflowManagerState) {
  }

  ngOnInit(): void {
    this.layers$ = this.workflowManager.getCurrentLayerHierarchy();
  }

  selectLayer(layerId: string): void{
    this.workflowManager.selectLayer(layerId);
  }

}
