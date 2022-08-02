import {Injectable} from '@angular/core';
import {LabResourceService} from '../../../entity-service/lab-resource.service';
import {ClCachedObservable} from '@monorepo/core-lib';
import {
  LabResourceView,
  LabResourceViewSpecWithConfig
} from '../../../model/entities/resource/lab-resource-view.entity';
import {LabResourceDetailTabsState} from './lab-resource-detail-tabs-state';
import {firstValueFrom, Observable} from 'rxjs';
import {LabResource} from '../../../model/entities/resource/lab-resource.entity';
import {LabTag} from '../../../model/entities/lab-tag.entity';
import {LabResourceViewSpecsByType} from '../../../model/entities/resource/lab-resource-view-type.class';

/**
 * State for the resource with view component. it is for one resource and one view.
 */
@Injectable()
export class LabResourceViewState {

  private resourceId: string;
  private viewSymbol: symbol;

  private viewSpecs$: ClCachedObservable<LabResourceViewSpecsByType[]>;

  // store the last view spec used to pre-configure the next view if portal is opened
  private lastViewSpec?: LabResourceViewSpecWithConfig = null;


  constructor(private resourceService: LabResourceService,
              private tabsState: LabResourceDetailTabsState) {
  }


  public init(resourceId: string, viewSymbol: symbol): void {
    this.resourceId = resourceId;
    this.viewSymbol = viewSymbol;

    // load the views with cache
    this.viewSpecs$ = new ClCachedObservable(this.resourceService.getResourceViewsListGrouped(resourceId));
  }

  public getResource$(): Observable<LabResource> {
    return this.tabsState.getResource$(this.resourceId);
  }

  public getResourcePromise(): Promise<LabResource> {
    return firstValueFrom(this.getResource$());
  }

  public getView$(): Observable<LabResourceView> {
    return this.tabsState.getView$(this.viewSymbol);
  }

  public getViewConfig(): LabResourceViewSpecWithConfig {
    return this.tabsState.getViewConfig(this.viewSymbol);
  }

  public updateResource(resource: LabResource): void {
    this.tabsState.updateResource(resource);

    // reload the views
    this.viewSpecs$ = new ClCachedObservable(this.resourceService.getResourceViewsListGrouped(resource.id));
  }

  public setResourceTags(tags: LabTag[]): void {
    this.tabsState.updateResourceTags(this.resourceId, tags);
  }

  /////////////////////////////////// VIEW SPEC //////////////////////////////////////////
  public getViewSpecs$(): Observable<LabResourceViewSpecsByType[]> {
    return this.viewSpecs$.getObs();
  }

  public callView(viewSpec: LabResourceViewSpecWithConfig): void {
    this.lastViewSpec = viewSpec;
    this.tabsState.loadView(viewSpec);
  }

  public getLastViewSpec(): LabResourceViewSpecWithConfig {
    return this.lastViewSpec ?? this.getViewConfig();
  }
}
