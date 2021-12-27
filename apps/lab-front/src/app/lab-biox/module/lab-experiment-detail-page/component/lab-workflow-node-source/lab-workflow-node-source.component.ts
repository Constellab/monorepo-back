import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Observable} from 'rxjs';
import {LabWorkflowManagerState} from '../../state/lab-workflow-manager-state';
import {FlDialogService, FlStatusEvent} from '@monorepo/front-core-lib';
import {LabWorkflowActionState} from '../../state/lab-workflow-action-state';
import {LabWorkflowNodeSource} from '../../model/lab-workflow-node-source.class';
import {map} from 'rxjs/operators';
import {LabResource} from '../../../../../lab-core/model/entities/resource/lab-resource.entity';

/**
 * Node of an experiment in the workflow specifically for the Source process
 *
 * This component is converted to an angular element to be injectable in html
 */
@Component({
  selector: 'lab-workflow-node-source',
  templateUrl: './lab-workflow-node-source.component.html',
  styleUrls: ['./lab-workflow-node-source.component.scss']
})
export class LabWorkflowNodeSourceComponent implements OnInit {

  // Name of the node
  @Input() name: string;

  @ViewChild('container', {static: true}) container: ElementRef<HTMLElement>;

  title$: Observable<string>;

  node: LabWorkflowNodeSource;


  constructor(private workflowManager: LabWorkflowManagerState,
              private dialogService: FlDialogService,
              private drawerState: LabWorkflowActionState) {
  }

  ngOnInit(): void {
    this.node = this.workflowManager.findNodeWithName(this.name) as LabWorkflowNodeSource;
    if (this.node == null) {
      console.error('Couldn\'t find node with name : ' + this.name);
    }

    // if the resource is loaded, use the name of the resource, otherwise, take the node title
    this.title$ = this.node.getLoadedResource$().pipe(
      map(loadedResource => this.getTitle(loadedResource))
    );
  }

  private getTitle(resource: FlStatusEvent<LabResource>): string {
    if (resource.status === 'success') {
      return resource.object != null ? resource.object.name : this.node.title;
    } else if (resource.status === 'error') {
      return 'ERROR'; // todo to improve
    } else {
      return this.node.title;
    }
  }


  openNodeDetail(): void {
    this.drawerState.newAction({
      action: 'selectNode',
      processNode: this.node,
      title: this.node.title
    });
  }

}
