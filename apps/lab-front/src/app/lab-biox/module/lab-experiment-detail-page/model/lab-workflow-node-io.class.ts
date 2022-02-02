import {LabWorkflowNodeProcess} from './lab-workflow-node-process.class';
import {LabProcess} from '../../../../lab-core/model/entities/process/lab-process.entity';
import {BehaviorSubject, Observable} from 'rxjs';
import {LabResource} from '../../../../lab-core/model/entities/resource/lab-resource.entity';
import {FlStatusEvent} from '@monorepo/front-core-lib';
import {LabWorkflowPort} from './lab-workflow-port.class';
import {labGetTypingNameColor} from '../../../../lab-core/entity-module/lab-process-core/utils/lab-process-port-color';
import {map, switchMap} from 'rxjs/operators';


/**
 * Representation of a Source or Output process
 */
export class LabWorkflowNodeIO extends LabWorkflowNodeProcess {

  private loadedResource$: BehaviorSubject<FlStatusEvent<LabResource>> = new BehaviorSubject({status: 'loading'});

  constructor(process: LabProcess,
              processName: string,
              // observable of the resource defined in the config
              private loadResource: (id: string) => Observable<LabResource>,
              initialCoordX: number = 0, initialCoordY: number = 0) {
    super(process, processName, initialCoordX, initialCoordY);
    this.initLoadedResource();
  }

  private getResourceId(process: LabProcess): string | null {
    if (this.currentObject.isSource()) {
      return process.config.data.values?.resource_id ?? null;
    } else {
      return process.inputs['resource'].resource_id;
    }
  }

  private initLoadedResource(): void {
    this.getObject$().pipe(
      switchMap(process => this.loadResource(this.getResourceId(process)))
    ).subscribe(
      resource => this.setLoadedResource(resource),
      error => this.loadedResource$.next({status: 'error', error: error})
    );
  }

  getHTML(): string {
    if (this.currentObject.isSource()) {
      return `<lab-workflow-node-source name="${this.nodeName}"></lab-workflow-node-source>`;
    } else {
      return `<lab-workflow-node-output name="${this.nodeName}"></lab-workflow-node-output>`;

    }
  }

  getClassName(): string {
    if (this.currentObject.isSource()) {
      return 'task-source';
    } else {
      return 'task-output';
    }
  }

  // get the resource in the config
  public getLoadedResource$(): Observable<FlStatusEvent<LabResource>> {
    return this.loadedResource$.asObservable();
  }

  // if the resource is loaded, use the name of the resource, otherwise, take the node title
  public getTitle$(): Observable<string> {
    return this.getLoadedResource$().pipe(
      map(resource => {
        if (resource.status === 'success') {
          return resource.object != null ? resource.object.name : this.title;
        } else if (resource.status === 'error') {
          return 'ERROR'; // todo to improve
        } else {
          return this.title;
        }
      })
    );
  }

  public getResourceId$(): Observable<string> {
    return this.getLoadedResource$().pipe(
      map(resourceStatus => resourceStatus.status === 'success' && resourceStatus.object ? resourceStatus.object.id : null)
    );
  }

  public setLoadedResource(resource: LabResource): void {
    this.loadedResource$.next({status: 'success', object: resource});
    // refresh the port color base on selected resource
    this.setPortColor(resource);
  }

  // set the port color based on selected resource
  private setPortColor(resource: LabResource | null): void {
    const port = this.getPort();

    const portElement: HTMLElement = this.getPortElement(port.drawFlowName);

    if (portElement == null) return;

    if (resource) {
      this.setPortElementColor(portElement, labGetTypingNameColor(resource.resourceTypingName));
    } else {
      this.setPortElementColor(portElement, port.getColor());
    }
  }

  // return the only port (output for source and input for output)
  private getPort(): LabWorkflowPort {
    if (this.currentObject.isSource()) {
      return this.outputPorts[0];
    } else {
      return this.inputPorts[0];
    }
  }


  destroy(): void {
    super.destroy();
    this.loadedResource$.complete();
  }
}
