import {WorkflowNodeProcess} from './workflow-node-process.class';
import {BioxProcess} from '../../../../core/model/entities/process/biox-process.entity';
import {BehaviorSubject, Observable} from 'rxjs';
import {BioxResource} from '../../../../core/model/entities/resource/biox-resource.entity';
import {FlStatusEvent} from '@monorepo/front-core-lib';


/**
 * Representation of a Source process
 */
export class WorkflowNodeSource extends WorkflowNodeProcess {

  private loadedResource$: BehaviorSubject<FlStatusEvent<BioxResource>> = new BehaviorSubject({status: 'loading'});

  constructor(process: BioxProcess,
              processName: string,
              // observable of the resource defined in the config
              loadedResource: Observable<BioxResource>,
              initialCoordX: number = 0, initialCoordY: number = 0) {
    super(process, processName, initialCoordX, initialCoordY);
    this.initLoadedResource(loadedResource);
  }

  private initLoadedResource(loadedResource$: Observable<BioxResource>): void {
    loadedResource$.subscribe(
      resource => this.loadedResource$.next({status: 'success', object: resource}),
      error => this.loadedResource$.next({status: 'error', error: error})
    );
  }

  getHTML(): string {
    return `<biox-workflow-node-source name="${this.nodeName}"></biox-workflow-node-source>`;
  }

  getClassName(): string {
    return 'task-source';
  }

  // get the resource in the config
  public getLoadedResource$(): Observable<FlStatusEvent<BioxResource>> {
    return this.loadedResource$.asObservable();
  }

  public setLoadedResource(resource: BioxResource): void {
    this.loadedResource$.next({status: 'success', object: resource});
  }


  destroy(): void {
    super.destroy();
    this.loadedResource$.complete();
  }
}
