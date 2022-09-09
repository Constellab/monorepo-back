import {PrProcess} from '../pr-process.entity';
import {PrWorkflowPort} from '../pr-workflow-port.class';
import {PrWorkflowNodeProcess} from './pr-workflow-node-process.class';
import {BehaviorSubject, distinctUntilChanged, map, Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {FlStatusEvent, FlTranslatableText} from '@monorepo/front-core-lib';
import {PrResource} from '../pr-resource.class';
import {tdGetTypingNameColor} from '@monorepo/technical-doc';

export abstract class PrWorkflowNodeIo extends PrWorkflowNodeProcess {

  private loadedResource$: BehaviorSubject<FlStatusEvent<PrResource>> = new BehaviorSubject({status: 'loading'});

  constructor(process: PrProcess,
              // observable of the resource defined in the config
              private loadResource: (id: string) => Observable<PrResource>,
              initialCoordX: number = 0, initialCoordY: number = 0,
              additionalObject: any = null) {
    super(process, initialCoordX, initialCoordY, additionalObject);
    this.initLoadedResource();
  }

  protected abstract getPort(): PrWorkflowPort;

  public initPortColors(): void {
    this.setPortColor(this.getCurrentResource());
  }

  // if the resource is loaded, use the name of the resource, otherwise, take the node title
  public getTitle$(): Observable<FlTranslatableText> {
    return this.getLoadedResource$().pipe(
      map(resource => {
        if (resource.status === 'success') {
          return resource.object != null ? resource.object.name : this.currentObject.humanName;
        } else if (resource.status === 'error') {
          return {text: 'pr.error', translateText: true};
        } else {
          return this.currentObject.humanName;
        }
      })
    );
  }

  // set the port color based on selected resource
  private setPortColor(resource: PrResource): void {
    const port = this.getPort();

    const portElement: HTMLElement = port ? this.getPortElement(port.drawFlowName) : null;

    if (portElement == null) return;

    if (resource) {
      this.setPortElementColor(portElement, tdGetTypingNameColor(resource.resourceTypingName));
    } else {
      this.setPortElementColor(portElement, port.getDefaultColor());
    }
  }

  /////////////////////// RESOURCE ///////////////////////
  protected abstract getResourceId(process: PrProcess): string | null;

  private initLoadedResource(): void {
    this.getObject$().pipe(
      map(process => this.getResourceId(process)),
      distinctUntilChanged(),
      switchMap(resourceId => this.loadResource(resourceId)),
    ).subscribe({
      next: resource => this.setLoadedResource(resource),
      error: error => this.loadedResource$.next({status: 'error', error: error})
    });
  }

  // get the resource in the config
  public getLoadedResource$(): Observable<FlStatusEvent<PrResource>> {
    return this.loadedResource$.asObservable();
  }

  public getResourceId$(): Observable<string> {
    return this.getLoadedResource$().pipe(
      map(resourceStatus => resourceStatus?.status === 'success' && resourceStatus.object ? resourceStatus.object.id : null)
    );
  }

  public getCurrentResource(): PrResource | null {
    const resourceStatus = this.loadedResource$.value;
    return resourceStatus?.status === 'success' && resourceStatus.object ? resourceStatus.object : null;
  }

  public setLoadedResource(resource: PrResource): void {
    this.loadedResource$.next({status: 'success', object: resource});
    // refresh the port color base on selected resource
    this.setPortColor(resource);
  }

}
