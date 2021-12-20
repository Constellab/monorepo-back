import {Component, OnInit} from '@angular/core';
import {LabWorkflowManagerState} from '../../state/lab-workflow-manager-state';
import {Observable} from 'rxjs';
import {LabWorkflowLayer} from '../../model/lab-workflow-layer.class';

/**
 * Component to show the current layer hierarchy
 */
@Component({
  selector: 'lab-workflow-layers-breadcrumb',
  templateUrl: './lab-workflow-layers-breadcrumb.component.html',
  styleUrls: ['./lab-workflow-layers-breadcrumb.component.scss']
})
export class LabWorkflowLayersBreadcrumbComponent implements OnInit {

  layers$: Observable<LabWorkflowLayer[]>;

  constructor(private workflowManager: LabWorkflowManagerState) {
  }

  ngOnInit(): void {
    this.layers$ = this.workflowManager.getCurrentLayerHierarchy();
  }

  selectLayer(layerId: string): void {
    this.workflowManager.selectLayer(layerId);
  }


}
