import {Component, OnInit} from '@angular/core';
import {WorkflowManagerService} from '../../service/workflow-manager.service';
import {Observable} from 'rxjs';
import {WorkflowLayer} from '../../model/workflow-layer.class';

/**
 * Component to show the current layer hierarchy
 */
@Component({
  selector: 'gen-biox-workflow-layers-breadcrumb',
  templateUrl: './biox-workflow-layers-breadcrumb.component.html',
  styleUrls: ['./biox-workflow-layers-breadcrumb.component.scss']
})
export class BioxWorkflowLayersBreadcrumbComponent implements OnInit {

  layers$: Observable<WorkflowLayer[]>;

  constructor(private workflowManager: WorkflowManagerService) {
  }

  ngOnInit(): void {
    this.layers$ = this.workflowManager.getCurrentLayerHierarchy();
  }

  selectLayer(layerId: string): void {
    this.workflowManager.selectLayer(layerId);
  }


}
