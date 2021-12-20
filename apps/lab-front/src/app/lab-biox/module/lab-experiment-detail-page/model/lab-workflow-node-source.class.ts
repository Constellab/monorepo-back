import {LabWorkflowNodeProcess} from './lab-workflow-node-process.class';
import {LabProcess} from '../../../../lab-core/model/entities/process/lab-process.entity';
import {BehaviorSubject, Observable} from 'rxjs';
import {LabResource} from '../../../../lab-core/model/entities/resource/lab-resource.entity';
import {FlStatusEvent} from '@monorepo/front-core-lib';


/**
 * Representation of a Source process
 */
export class LabWorkflowNodeSource extends LabWorkflowNodeProcess {

  private loadedResource$: BehaviorSubject<FlStatusEvent<LabResource>> = new BehaviorSubject({status: 'loading'});

  constructor(process: LabProcess,
              processName: string,
              // observable of the resource defined in the config
              loadedResource: Observable<LabResource>,
              initialCoordX: number = 0, initialCoordY: number = 0) {
    super(process, processName, initialCoordX, initialCoordY);
    this.initLoadedResource(loadedResource);
  }

  private initLoadedResource(loadedResource$: Observable<LabResource>): void {
    loadedResource$.subscribe(
      resource => this.loadedResource$.next({status: 'success', object: resource}),
      error => this.loadedResource$.next({status: 'error', error: error})
    );
  }

  getHTML(): string {
    return `<lab-workflow-node-source name="${this.nodeName}"></lab-workflow-node-source>`;
  }

  getClassName(): string {
    return 'task-source';
  }

  // get the resource in the config
  public getLoadedResource$(): Observable<FlStatusEvent<LabResource>> {
    return this.loadedResource$.asObservable();
  }

  public setLoadedResource(resource: LabResource): void {
    this.loadedResource$.next({status: 'success', object: resource});
  }


  destroy(): void {
    super.destroy();
    this.loadedResource$.complete();
  }
}
