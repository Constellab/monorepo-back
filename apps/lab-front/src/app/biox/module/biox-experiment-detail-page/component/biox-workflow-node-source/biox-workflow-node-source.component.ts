import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Observable} from 'rxjs';
import {WorkflowManagerState} from '../../state/workflow-manager-state';
import {FlDialogService, FlPortalService} from '@monorepo/front-core-lib';
import {WorkflowActionState} from '../../state/workflow-action-state';
import {WorkflowNodeSource} from '../../model/workflow-node-source.class';
import {map} from 'rxjs/operators';

/**
 * Node of an experiment in the workflow specifically for the Source process
 *
 * This component is converted to an angular element to be injectable in html
 */
@Component({
  selector: 'gen-biox-workflow-node-source',
  templateUrl: './biox-workflow-node-source.component.html',
  styleUrls: ['./biox-workflow-node-source.component.scss']
})
export class BioxWorkflowNodeSourceComponent implements OnInit {

  // Name of the node
  @Input() name: string;

  @ViewChild('container', {static: true}) container: ElementRef<HTMLElement>;

  title$: Observable<string>;

  node: WorkflowNodeSource;


  constructor(private workflowManager: WorkflowManagerState,
              private dialogService: FlDialogService,
              private portalService: FlPortalService,
              private drawerState: WorkflowActionState) {
  }

  ngOnInit(): void {
    this.node = this.workflowManager.findNodeWithName(this.name) as WorkflowNodeSource;
    if (this.node == null) {
      console.error('Couldn\'t find node with name : ' + this.name);
    }

    // if the resource is loaded, use the name of the resource, otherwise, take the node title
    this.title$ = this.node.getLoadedResource$().pipe(
      map(resource => resource != null ? resource.name : this.node.title)
    );
  }


  openNodeDetail(): void {
    this.drawerState.newAction({
      action: 'selectNode',
      processNode: this.node,
      title: this.node.title
    });
  }

}
